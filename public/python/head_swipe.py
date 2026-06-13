"""
Instagram Reels - Head Swipe Scroller
======================================
Swipe your head UP fast   → Next reel
Swipe your head DOWN fast → Prev reel

Works exactly like a finger swipe — it detects the SPEED of your head
movement, not position. A quick flick up/down triggers it. Sitting still
or moving slowly does nothing.

Install:
  pip install opencv-python mediapipe pyautogui

Run:
  python head_swipe.py

Keys:  Q = quit   D = debug overlay
"""

import cv2
import mediapipe as mp
import pyautogui
import time
import sys
from collections import deque

# ── Settings ──────────────────────────────────────────────────────────────────
SCROLL_AMOUNT   = 400

# Swipe speed threshold — how fast the nose must move (in % of frame height per second)
# Default 55 means nose must travel 55% of frame height per second to count as swipe.
# Lower = more sensitive  |  Higher = needs a faster flick
SWIPE_SPEED     = 55

COOLDOWN        = 1.0       # seconds before another swipe can trigger
TRAIL_FRAMES    = 6         # frames of nose history used to compute velocity
PREVIEW_SCALE   = 0.65
# ──────────────────────────────────────────────────────────────────────────────

NOSE_TIP = 4   # MediaPipe nose tip landmark

mp_face = mp.solutions.face_mesh


def main():
    pyautogui.FAILSAFE = True
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("ERROR: cannot open webcam"); sys.exit(1)

    # Rolling history of (timestamp, nose_y) to compute velocity
    history     = deque(maxlen=TRAIL_FRAMES)
    last_scroll = 0
    debug       = False
    msg         = "👁 Ready — swipe head up/down!"
    velocity    = 0.0

    print("Head Swipe Scroller ready!")
    print("  Swipe head UP fast   → next reel")
    print("  Swipe head DOWN fast → prev reel")
    print("  Q=quit  D=debug\n")

    with mp_face.FaceMesh(
            max_num_faces=1,
            refine_landmarks=False,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.7) as fm:

        while cap.isOpened():
            ok, frame = cap.read()
            if not ok: break

            frame = cv2.flip(frame, 1)
            h, w  = frame.shape[:2]
            now   = time.time()
            res   = fm.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

            nose_y = None

            if res.multi_face_landmarks:
                lm     = res.multi_face_landmarks[0].landmark
                nose_y = lm[NOSE_TIP].y   # 0.0 = top of frame, 1.0 = bottom

                # Track nose position over time
                history.append((now, nose_y))

                # ── Compute velocity (% frame height per second) ───────────────
                if len(history) >= 2:
                    dt = history[-1][0] - history[0][0]
                    dy = history[-1][1] - history[0][1]   # positive = moved DOWN
                    velocity = (dy / dt) * 100 if dt > 0 else 0.0
                else:
                    velocity = 0.0

                # ── Swipe detection ────────────────────────────────────────────
                if now - last_scroll > COOLDOWN:

                    if velocity < -SWIPE_SPEED:
                        # Nose moved UP fast → swipe up → next reel
                        pyautogui.scroll(-SCROLL_AMOUNT)
                        last_scroll = now
                        history.clear()
                        msg = "👆 Next reel!"
                        print(f"  SWIPE UP   vel={velocity:.1f}")

                    elif velocity > SWIPE_SPEED:
                        # Nose moved DOWN fast → swipe down → prev reel
                        pyautogui.scroll(SCROLL_AMOUNT)
                        last_scroll = now
                        history.clear()
                        msg = "👇 Prev reel!"
                        print(f"  SWIPE DOWN vel={velocity:.1f}")

                    else:
                        # Fade message back to ready after 1.5 sec
                        if now - last_scroll > 1.5:
                            msg = "👁 Ready — swipe head up/down!"

                # ── Draw nose dot ──────────────────────────────────────────────
                nx = int(lm[NOSE_TIP].x * w)
                ny = int(nose_y * h)
                cv2.circle(frame, (nx, ny), 6, (0, 255, 100), -1)

                # ── Draw swipe trail ───────────────────────────────────────────
                pts = [(int(lm[NOSE_TIP].x * w), int(t[1] * h)) for t in history]
                for i in range(1, len(pts)):
                    alpha = int(255 * i / len(pts))
                    cv2.line(frame, pts[i-1], pts[i], (0, alpha, 255-alpha), 2)

                # ── Debug overlay ──────────────────────────────────────────────
                if debug:
                    # Velocity bar (horizontal, centered)
                    bx, by2, bw2, bh2 = w//2 - 100, h - 45, 200, 14
                    cv2.rectangle(frame, (bx, by2), (bx+bw2, by2+bh2), (50,50,50), -1)

                    MAX_V = SWIPE_SPEED * 2
                    norm  = max(0.0, min(1.0, (velocity + MAX_V) / (2 * MAX_V)))
                    bar_x = int(bx + norm * bw2)
                    mid_x = bx + bw2 // 2

                    bar_color = (0,255,100) if abs(velocity) < SWIPE_SPEED else (0,80,255)
                    cv2.rectangle(frame, (mid_x, by2), (bar_x, by2+bh2), bar_color, -1)
                    cv2.line(frame, (mid_x, by2-4), (mid_x, by2+bh2+4), (255,255,255), 2)

                    # threshold lines
                    up_x   = int(bx + ((MAX_V - SWIPE_SPEED) / (2*MAX_V)) * bw2)
                    down_x = int(bx + ((MAX_V + SWIPE_SPEED) / (2*MAX_V)) * bw2)
                    cv2.line(frame, (up_x,   by2-4), (up_x,   by2+bh2+4), (0,255,80), 2)
                    cv2.line(frame, (down_x, by2-4), (down_x, by2+bh2+4), (0,80,255), 2)

                    cv2.putText(frame, f"vel: {velocity:+.1f}  threshold: ±{SWIPE_SPEED}",
                                (bx, by2-8), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (0,210,255), 1)

            else:
                msg = "⚠ No face — move closer"
                history.clear()

            # ── HUD ────────────────────────────────────────────────────────────
            col = (0, 255, 120) if "Ready" in msg else (0, 200, 255)
            if "reel" in msg: col = (0, 255, 0)
            cv2.putText(frame, msg, (10, 32), cv2.FONT_HERSHEY_SIMPLEX, 0.75, col, 2)
            cv2.putText(frame, "Q=quit  D=debug",
                        (10, h-10), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (160,160,160), 1)

            cv2.imshow("Head Swipe Scroller",
                       cv2.resize(frame, (int(w*PREVIEW_SCALE), int(h*PREVIEW_SCALE))))

            k = cv2.waitKey(1) & 0xFF
            if   k == ord('q'): break
            elif k == ord('d'):
                debug = not debug
                print(f"  Debug {'ON' if debug else 'OFF'}")

    cap.release()
    cv2.destroyAllWindows()
    print("Done.")

if __name__ == "__main__":
    main()
