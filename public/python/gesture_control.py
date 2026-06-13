"""
╔══════════════════════════════════════════════════════════════════╗
║           GESTURE CONTROL SYSTEM  v2  - Full Laptop Control      ║
║                                                                  ║
║  INSTALL:                                                        ║
║    pip install opencv-python mediapipe pyautogui pynput numpy    ║
║                                                                  ║
║  RUN:  python gesture_control.py                                 ║
║  QUIT: Press Q in the camera window                              ║
╚══════════════════════════════════════════════════════════════════╝

GESTURES (v2):
  Index finger only        Move cursor  (full-screen mapped, adaptive smooth)
  Index + Middle up        Scroll up / down
  Pinch (thumb+index)      Left click / Drag & Drop
  Pinch + middle finger    Right click
  Thumb pointing RIGHT     Next tab  (Alt+Tab)
  Thumb pointing LEFT      Prev tab  (Alt+Shift+Tab)
  Both hands OPEN          Show virtual keyboard  (stays on screen)
  Both hands FIST          Hide virtual keyboard
  One hand pinches,        Drag-and-drop across tabs:
   other hand steers        pinching hand holds selection,
                            other hand moves the cursor
"""

import cv2
import mediapipe as mp
import pyautogui
import numpy as np
import time
from pynput.mouse import Button, Controller as MouseController
from pynput.keyboard import Key, Controller as KeyboardController

# ══════════════════════════════════════════════════
#  TUNABLE CONFIG
# ══════════════════════════════════════════════════
CAMERA_INDEX    = 0
CAM_W, CAM_H    = 1280, 720     # higher res → sharper tracking

CURSOR_MARGIN   = 0.08          # fraction of frame edge treated as dead-zone
                                # smaller = cursor can reach screen corners easily

SMOOTH_SLOW     = 0.12          # weight for new pos when hand barely moving
SMOOTH_FAST     = 0.50          # weight when hand is moving fast
FAST_THRESH_PX  = 60            # pixel delta/frame to switch to fast smoothing

PINCH_ON        = 0.055         # normalised distance to enter pinch
PINCH_OFF       = 0.075         # wider gap needed to exit pinch (hysteresis)
DRAG_HOLD_TIME  = 0.30          # seconds pinch must be held before drag starts

SCROLL_SENS     = 28
SCROLL_DEAD     = 0.004         # ignore tiny vertical jitter

TAB_COOLDOWN    = 0.8           # seconds between alt-tab triggers
THUMB_RATIO     = 0.16          # thumb must protrude this far horizontally

KB_PINCH_COOL   = 0.45          # seconds between keyboard key triggers

pyautogui.FAILSAFE = False
pyautogui.PAUSE    = 0

# ══════════════════════════════════════════════════
#  KEYBOARD LAYOUT
# ══════════════════════════════════════════════════
KB_ROWS = [
    ["Q","W","E","R","T","Y","U","I","O","P"],
    ["A","S","D","F","G","H","J","K","L","ENT"],
    ["Z","X","C","V","B","N","M","DEL","SPC"],
]
KB_W, KB_H = 54, 52   # per-key pixel size

# ══════════════════════════════════════════════════
#  PURE HELPERS
# ══════════════════════════════════════════════════
def _dist(a, b):
    return float(np.hypot(a[0]-b[0], a[1]-b[1]))

def _lm(hlms, idx):
    p = hlms.landmark[idx]
    return p.x, p.y

def _fingers_up(hlms, label):
    """
    Returns [thumb, index, middle, ring, pinky] booleans.
    label: 'Left' or 'Right' from MediaPipe (already accounts for mirroring).
    """
    lm = hlms.landmark
    # Thumb: horizontal direction depends on which hand
    if label == "Right":
        thumb = lm[4].x < lm[3].x
    else:
        thumb = lm[4].x > lm[3].x
    others = [lm[t].y < lm[p].y for t, p in [(8,6),(12,10),(16,14),(20,18)]]
    return [thumb] + others

def _is_open(hlms, label):
    f = _fingers_up(hlms, label)
    return f[1] and f[2] and f[3] and f[4]

def _is_fist(hlms, label):
    f = _fingers_up(hlms, label)
    return not any(f)

def _thumb_dir(hlms, label):
    """Returns 'right', 'left', or None. Only fires when other fingers curled."""
    f = _fingers_up(hlms, label)
    if any(f[1:]):           # some finger is up — not a thumb-only pose
        return None
    lm = hlms.landmark
    dx = lm[4].x - lm[0].x  # thumb tip vs wrist
    if abs(dx) < THUMB_RATIO:
        return None
    return 'right' if dx > 0 else 'left'

# ══════════════════════════════════════════════════
#  CONTROLLER
# ══════════════════════════════════════════════════
class GestureController:

    def __init__(self):
        self.mp_h = mp.solutions.hands
        self.hands = self.mp_h.Hands(
            static_image_mode=False,
            max_num_hands=2,
            model_complexity=1,
            min_detection_confidence=0.72,
            min_tracking_confidence=0.65,
        )
        self.draw = mp.solutions.drawing_utils
        self.dot_s  = self.draw.DrawingSpec(color=(0,230,160), thickness=-1, circle_radius=5)
        self.line_s = self.draw.DrawingSpec(color=(0,180,110), thickness=2)

        self.mouse = MouseController()
        self.kb    = KeyboardController()
        self.sw, self.sh = pyautogui.size()

        self.cx = float(self.sw // 2)
        self.cy = float(self.sh // 2)

        # gesture state
        self.prev_scroll_y  = None
        self.pinch_active   = False
        self.pinch_time     = 0.0
        self.is_dragging    = False
        self.two_hand_drag  = False     # drag held by one hand, steered by other

        self.last_tab_time  = 0.0
        self.last_thumb_dir = None

        self.show_kb        = False     # keyboard visible?
        self.kb_pinch_time  = 0.0

        self.fw = self.fh = 640

    # ─────────────────────────────────────────────
    #  Screen mapping + smoothing
    # ─────────────────────────────────────────────
    def _to_screen(self, nx, ny):
        m = CURSOR_MARGIN
        sx = float(np.interp(nx, [m, 1-m], [0, self.sw]))
        sy = float(np.interp(ny, [m, 1-m], [0, self.sh]))
        return np.clip(sx, 0, self.sw), np.clip(sy, 0, self.sh)

    def _move(self, tx, ty):
        d = np.hypot(tx - self.cx, ty - self.cy)
        a = SMOOTH_FAST if d > FAST_THRESH_PX else SMOOTH_SLOW
        self.cx += a * (tx - self.cx)
        self.cy += a * (ty - self.cy)
        self.mouse.position = (int(self.cx), int(self.cy))

    # ─────────────────────────────────────────────
    #  Virtual keyboard
    # ─────────────────────────────────────────────
    def _draw_kb(self, frame, px=None, py=None, pinching=False):
        fh, fw = frame.shape[:2]
        pressed = None
        total_h = len(KB_ROWS) * (KB_H+6) + 14
        top_y   = fh - total_h - 8

        # semi-transparent backing
        ov = frame.copy()
        cv2.rectangle(ov, (0, top_y - 10), (fw, fh), (18, 18, 24), -1)
        cv2.addWeighted(ov, 0.78, frame, 0.22, 0, frame)

        for ri, row in enumerate(KB_ROWS):
            row_w   = len(row) * (KB_W+5) - 5
            start_x = (fw - row_w) // 2
            for ci, key in enumerate(row):
                kx  = start_x + ci*(KB_W+5)
                ky  = top_y + ri*(KB_H+6)
                kx2 = kx + KB_W
                ky2 = ky + KB_H
                hit = pinching and px and (kx < px < kx2) and (ky < py < ky2)
                if hit:
                    pressed = key
                bg = (0,170,90) if hit else (48,50,62)
                cv2.rectangle(frame, (kx, ky), (kx2, ky2), bg, -1)
                cv2.rectangle(frame, (kx, ky), (kx2, ky2), (110,115,145), 1)
                fs   = 0.50 if len(key) > 1 else 0.62
                tsz  = cv2.getTextSize(key, cv2.FONT_HERSHEY_SIMPLEX, fs, 2)[0]
                tx   = kx + (KB_W - tsz[0]) // 2
                ty2  = ky + (KB_H + tsz[1]) // 2
                cv2.putText(frame, key, (tx, ty2),
                            cv2.FONT_HERSHEY_SIMPLEX, fs, (240,240,240), 2)
        return frame, pressed

    def _type(self, key):
        k = key.upper()
        if k == "DEL":
            self.kb.press(Key.backspace); self.kb.release(Key.backspace)
        elif k == "SPC":
            self.kb.press(Key.space);     self.kb.release(Key.space)
        elif k == "ENT":
            self.kb.press(Key.enter);     self.kb.release(Key.enter)
        else:
            self.kb.press(k.lower());     self.kb.release(k.lower())

    # ─────────────────────────────────────────────
    #  HUD helpers
    # ─────────────────────────────────────────────
    def _txt(self, frame, text, x, y, color=(255,255,255), scale=0.65, thick=2):
        cv2.putText(frame, text, (x,y), cv2.FONT_HERSHEY_SIMPLEX, scale, (0,0,0), thick+2)
        cv2.putText(frame, text, (x,y), cv2.FONT_HERSHEY_SIMPLEX, scale, color, thick)

    def _legend(self, frame):
        items = [
            "Index only   = cursor",
            "2 fingers    = scroll",
            "Pinch        = click/drag",
            "Pinch+mid    = right click",
            "Thumb right  = next tab",
            "Thumb left   = prev tab",
            "Both open    = keyboard",
            "Both fist    = close KB",
            "Pinch+steer  = 2-hand drag",
            "Q = quit",
        ]
        for i, t in enumerate(items):
            self._txt(frame, t, self.fw-260, 26+i*23, (190,190,190), 0.40, 1)

    # ─────────────────────────────────────────────
    #  Main loop
    # ─────────────────────────────────────────────
    def run(self):
        cap = cv2.VideoCapture(CAMERA_INDEX)
        cap.set(cv2.CAP_PROP_FRAME_WIDTH,  CAM_W)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, CAM_H)
        cap.set(cv2.CAP_PROP_FPS, 60)

        cv2.namedWindow("GestureControl", cv2.WINDOW_NORMAL)
        cv2.resizeWindow("GestureControl", 800, 480)

        prev_t = time.time()

        while True:
            ret, frame = cap.read()
            if not ret:
                continue

            frame = cv2.flip(frame, 1)
            self.fh, self.fw = frame.shape[:2]

            rgb     = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.hands.process(rgb)

            # collect detected hands
            hands = []
            if results.multi_hand_landmarks and results.multi_handedness:
                for hlm, hd in zip(results.multi_hand_landmarks,
                                   results.multi_handedness):
                    lbl = hd.classification[0].label
                    hands.append((hlm, lbl))
                    self.draw.draw_landmarks(frame, hlm,
                        self.mp_h.HAND_CONNECTIONS, self.dot_s, self.line_s)
            n = len(hands)

            now = time.time()

            # ════════════════════════════════════════
            #  KEYBOARD TOGGLE (both hands open / fist)
            # ════════════════════════════════════════
            if n == 2:
                open0 = _is_open(hands[0][0], hands[0][1])
                open1 = _is_open(hands[1][0], hands[1][1])
                fist0 = _is_fist(hands[0][0], hands[0][1])
                fist1 = _is_fist(hands[1][0], hands[1][1])

                if open0 and open1 and not self.show_kb:
                    self.show_kb = True

                if fist0 and fist1 and self.show_kb:
                    self.show_kb = False
                    if self.pinch_active:
                        self.mouse.release(Button.left)
                        self.pinch_active = False
                        self.is_dragging  = False

            # ════════════════════════════════════════
            #  VIRTUAL KEYBOARD MODE
            # ════════════════════════════════════════
            if self.show_kb:
                px = py = None
                is_pinching = False
                for hlm, _ in hands:
                    tt = _lm(hlm, 4)
                    it = _lm(hlm, 8)
                    if _dist(tt, it) < PINCH_ON:
                        px = int(((tt[0]+it[0])/2) * self.fw)
                        py = int(((tt[1]+it[1])/2) * self.fh)
                        is_pinching = True
                        cv2.circle(frame, (px, py), 13, (0,255,130), -1)
                        break

                frame, key = self._draw_kb(frame, px, py, is_pinching)
                if is_pinching and key and now - self.kb_pinch_time > KB_PINCH_COOL:
                    self._type(key)
                    self.kb_pinch_time = now

                self._txt(frame, "KEYBOARD  |  Both FISTS to close",
                          10, 34, (0,255,180), 0.70)
                self._legend(frame)
                cv2.imshow("GestureControl", frame)
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break
                continue

            # ════════════════════════════════════════
            #  TWO-HAND DRAG (one holds pinch, other steers)
            # ════════════════════════════════════════
            if n == 2:
                d0 = _dist(_lm(hands[0][0],4), _lm(hands[0][0],8))
                d1 = _dist(_lm(hands[1][0],4), _lm(hands[1][0],8))
                p0 = d0 < PINCH_ON
                p1 = d1 < PINCH_ON

                if p0 != p1:     # exactly one hand pinching
                    steering_lms = hands[1][0] if p0 else hands[0][0]
                    if not self.pinch_active:
                        self.pinch_active  = True
                        self.two_hand_drag = True
                        self.is_dragging   = True
                        self.mouse.press(Button.left)

                    steer_tip = _lm(steering_lms, 8)
                    tx, ty    = self._to_screen(steer_tip[0], steer_tip[1])
                    self._move(tx, ty)

                    hx = int(steer_tip[0] * self.fw)
                    hy = int(steer_tip[1] * self.fh)
                    cv2.circle(frame, (hx,hy), 13, (255,140,0), -1)
                    cv2.circle(frame, (hx,hy), 15, (255,255,255), 2)
                    self._txt(frame, "TWO-HAND DRAG", 10, 36, (255,140,0), 0.75)
                    self._legend(frame)
                    fps = 1.0/max(now-prev_t, 1e-5); prev_t=now
                    self._txt(frame, f"FPS {fps:.0f}", self.fw-90, 28, (100,100,100), 0.48, 1)
                    cv2.imshow("GestureControl", frame)
                    if cv2.waitKey(1) & 0xFF == ord('q'):
                        break
                    continue
                else:
                    # neither or both pinching — release any drag
                    if self.two_hand_drag and self.pinch_active:
                        self.mouse.release(Button.left)
                        self.pinch_active  = False
                        self.is_dragging   = False
                        self.two_hand_drag = False

            # If two-hand drag and hand count drops
            if self.two_hand_drag and n < 2:
                self.mouse.release(Button.left)
                self.pinch_active  = False
                self.is_dragging   = False
                self.two_hand_drag = False

            # ════════════════════════════════════════
            #  SINGLE-HAND NORMAL GESTURES
            # ════════════════════════════════════════
            status = "No hand detected"
            sc     = (100,100,100)

            if n >= 1:
                hlm, lbl = hands[0]
                f  = _fingers_up(hlm, lbl)
                tt = _lm(hlm, 4)
                it = _lm(hlm, 8)
                mt = _lm(hlm, 12)
                pd = _dist(tt, it)

                # ── THUMB DIRECTION (alt-tab) ──────────
                tdir = _thumb_dir(hlm, lbl)
                if tdir and now - self.last_tab_time > TAB_COOLDOWN:
                    if tdir != self.last_thumb_dir:
                        self.last_thumb_dir = tdir
                        if tdir == 'right':
                            with self.kb.pressed(Key.alt):
                                self.kb.press(Key.tab)
                                self.kb.release(Key.tab)
                            status, sc = "NEXT TAB >>", (0,200,255)
                        else:
                            with self.kb.pressed(Key.alt):
                                self.kb.press(Key.shift)
                                self.kb.press(Key.tab)
                                self.kb.release(Key.tab)
                                self.kb.release(Key.shift)
                            status, sc = "<< PREV TAB", (0,200,255)
                        self.last_tab_time = now
                elif not tdir:
                    self.last_thumb_dir = None

                # ── CURSOR (index only) ────────────────
                if f[1] and not f[2] and not f[3] and not f[4] and not tdir:
                    tx, ty = self._to_screen(it[0], it[1])
                    self._move(tx, ty)
                    self.prev_scroll_y = None
                    status, sc = "CURSOR", (0,210,255)
                    hx = int(it[0]*self.fw); hy = int(it[1]*self.fh)
                    cv2.circle(frame, (hx,hy), 11, (0,230,160), -1)
                    cv2.circle(frame, (hx,hy), 13, (255,255,255), 2)

                # ── SCROLL (index+middle) ──────────────
                elif f[1] and f[2] and not f[3] and not f[4] and not tdir:
                    my = (it[1]+mt[1])/2
                    if self.prev_scroll_y is not None:
                        dy = self.prev_scroll_y - my
                        if abs(dy) > SCROLL_DEAD:
                            ticks = int(dy * SCROLL_SENS * 10)
                            if ticks:
                                pyautogui.scroll(ticks)
                    self.prev_scroll_y = my
                    status, sc = "SCROLL", (255,200,0)
                else:
                    if not tdir:
                        self.prev_scroll_y = None

                # ── PINCH (single hand) ────────────────
                if not self.two_hand_drag:
                    mid_up = f[2]
                    if pd < PINCH_ON:
                        if not self.pinch_active:
                            self.pinch_active = True
                            self.pinch_time   = now
                            self.is_dragging  = False
                            if mid_up:
                                self.mouse.click(Button.right)
                                status, sc = "RIGHT CLICK", (0,255,80)
                            else:
                                self.mouse.press(Button.left)
                                status, sc = "LEFT CLICK", (0,255,80)
                        else:
                            held = now - self.pinch_time
                            if not self.is_dragging and held > DRAG_HOLD_TIME and not mid_up:
                                self.is_dragging = True
                            if self.is_dragging:
                                mnx = (tt[0]+it[0])/2
                                mny = (tt[1]+it[1])/2
                                tx, ty = self._to_screen(mnx, mny)
                                self._move(tx, ty)
                                status, sc = "DRAGGING", (0,140,255)
                            elif mid_up:
                                status, sc = "RIGHT CLICK", (0,255,80)
                            else:
                                status, sc = "HOLDING", (0,255,80)

                    elif pd > PINCH_OFF and self.pinch_active:
                        self.mouse.release(Button.left)
                        self.pinch_active = False
                        self.is_dragging  = False

            elif n == 0:
                if self.pinch_active and not self.two_hand_drag:
                    self.mouse.release(Button.left)
                    self.pinch_active = False
                    self.is_dragging  = False
                self.prev_scroll_y = None

            self._txt(frame, status, 10, 36, sc, 0.75)
            self._legend(frame)
            fps = 1.0/max(now-prev_t, 1e-5); prev_t=now
            self._txt(frame, f"FPS {fps:.0f}", self.fw-90, 28, (100,100,100), 0.48, 1)
            cv2.imshow("GestureControl", frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        cap.release()
        cv2.destroyAllWindows()
        if self.pinch_active:
            self.mouse.release(Button.left)


# ══════════════════════════════════════════════════
if __name__ == "__main__":
    print(__doc__)
    try:
        gc = GestureController()
        gc.run()
    except ImportError as e:
        print(f"\n  Missing package: {e}")
        print("Run:  pip install opencv-python mediapipe pyautogui pynput numpy")
