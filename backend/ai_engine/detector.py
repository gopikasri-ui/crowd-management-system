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

        try:
            from pillow_heif import register_heif_opener
            register_heif_opener()
        except Exception:
            pass

        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img_array = np.array(image)
        img_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
        annotated = img_bgr.copy()
        count = 0

        height, width = img_bgr.shape[:2]
        if width > 800:
            scale = 800 / width
            img_bgr = cv2.resize(img_bgr, (int(width * scale), int(height * scale)))
            annotated = img_bgr.copy()

        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

        try:
            from ultralytics import YOLO
            model = YOLO("yolov8n.pt")
            results = model(img_bgr, classes=[0], conf=0.4, verbose=False)
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
            print(f"YOLO failed: {yolo_err}, using face+body detection")

            face_cascade = cv2.CascadeClassifier(
                cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            )
            faces = face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(30, 30)
            )

            upper_cascade = cv2.CascadeClassifier(
                cv2.data.haarcascades + 'haarcascade_upperbody.xml'
            )
            upper = upper_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=3,
                minSize=(60, 60)
            )

            face_regions = []

            for (x, y, w, h) in faces:
                cv2.rectangle(annotated, (x, y), (x + w, y + h), (0, 255, 0), 2)
                cv2.putText(
                    annotated,
                    "Person",
                    (x, y - 8),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.5,
                    (0, 255, 0),
                    1
                )
                face_regions.append((x, y, w, h))

            for (x, y, w, h) in upper:
                already_counted = False
                for (fx, fy, fw, fh) in face_regions:
                    if abs(x - fx) < 50 and abs(y - fy) < 100:
                        already_counted = True
                        break
                if not already_counted:
                    cv2.rectangle(annotated, (x, y), (x + w, y + h), (0, 200, 255), 2)
                    face_regions.append((x, y, w, h))

            count = len(face_regions)

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
        count = 0
        density = get_density_level(count)
        return {
            "count": count,
            "density": density,
            "recommendation": get_recommendation(density),
            "annotated_image": None
        }