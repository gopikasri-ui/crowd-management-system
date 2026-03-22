import random
import base64
import io

def get_density_level(count):
    if count < 10:
        return "Low"
    elif count < 30:
        return "Medium"
    elif count < 60:
        return "High"
    else:
        return "Critical"

def get_recommendation(density):
    if density == "Critical":
        return "Danger! Evacuate immediately and call emergency services."
    elif density == "High":
        return "High crowd detected. Avoid this area and use alternate routes."
    elif density == "Medium":
        return "Moderate crowd. Stay alert and maintain safe distance."
    else:
        return "Area is safe. Normal crowd levels detected."

def detect_from_image_bytes(image_bytes):
    try:
        import cv2
        import numpy as np
        from PIL import Image

        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img_array = np.array(image)
        img_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)

        count = 0
        annotated = img_bgr.copy()

        try:
            from ultralytics import YOLO
            model = YOLO("yolov8n.pt")
            results = model(img_bgr, classes=[0], conf=0.5, verbose=False)
            for r in results:
                count = len(r.boxes)
                for box in r.boxes:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    conf = float(box.conf[0])
                    cv2.rectangle(annotated, (x1, y1), (x2, y2), (0, 255, 255), 2)
                    cv2.putText(
                        annotated,
                        f"{int(conf * 100)}%",
                        (x1, y1 - 8),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.5,
                        (0, 255, 255),
                        1
                    )
        except Exception as yolo_err:
            print(f"YOLO not available: {yolo_err}")
            # ✅ FIXED HOG - less false detections
            hog = cv2.HOGDescriptor()
            hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())

            # Resize image - HOG works better on smaller images
            height, width = img_bgr.shape[:2]
            scale = 1.0
            if width > 800:
                scale = 800 / width
                img_bgr = cv2.resize(img_bgr, (int(width * scale), int(height * scale)))
                annotated = img_bgr.copy()

            gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
            boxes, weights = hog.detectMultiScale(
                gray,
                winStride=(12, 12),   # ✅ bigger stride = less false detections
                padding=(8, 8),
                scale=1.08,           # ✅ less scales = faster + accurate
                finalThreshold=2      # ✅ higher threshold = removes false boxes
            )

            # ✅ Filter only high confidence detections
            real_boxes = []
            for i, (x, y, w, h) in enumerate(boxes):
                if len(weights) > i and weights[i] > 0.5:
                    real_boxes.append((x, y, w, h))

            count = len(real_boxes)
            for (x, y, w, h) in real_boxes:
                cv2.rectangle(annotated, (x, y), (x + w, y + h), (0, 255, 0), 2)

        cv2.putText(
            annotated,
            f"People: {count}",
            (20, 45),
            cv2.FONT_HERSHEY_SIMPLEX,
            1.2,
            (0, 255, 0),
            3
        )

        _, buffer = cv2.imencode(".jpg", annotated)
        encoded = base64.b64encode(buffer).decode("utf-8")
        density = get_density_level(count)

        return {
            "count": count,
            "density": density,
            "recommendation": get_recommendation(density),
            "annotated_image": encoded
        }

    except Exception as e:
        print(f"Detection error: {e}")
        count = 0  # ✅ Return 0 instead of random number on error
        density = get_density_level(count)
        return {
            "count": count,
            "density": density,
            "recommendation": get_recommendation(density),
            "annotated_image": None
        }