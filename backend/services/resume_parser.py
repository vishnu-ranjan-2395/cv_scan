from pathlib import Path
import pymupdf
from docx import Document
import easyocr
import numpy as np
import cv2


# Load OCR model once
ocr_reader = easyocr.Reader(["en"], gpu=False)


def extract_from_pdf(file_path):
    text = ""

    document = pymupdf.open(file_path)

    for page in document:
        page_text = page.get_text().strip()

        if page_text:
            text += page_text + "\n"

        else:
            print(f"OCR processing PDF page {page.number + 1}...")

            pix = page.get_pixmap(
                matrix=pymupdf.Matrix(2, 2),
                alpha=False
            )

            image = np.frombuffer(
                pix.samples,
                dtype=np.uint8
            )

            image = image.reshape(
                pix.height,
                pix.width,
                pix.n
            )

            ocr_result = ocr_reader.readtext(
                image,
                detail=0,
                paragraph=True
            )

            text += "\n".join(ocr_result) + "\n"

    document.close()

    return text.strip()


def extract_from_docx(file_path):
    document = Document(file_path)

    text = []

    for paragraph in document.paragraphs:
        if paragraph.text.strip():
            text.append(paragraph.text)

    return "\n".join(text).strip()


def extract_from_image(file_path):
    print("OCR processing image resume...")

    image = cv2.imread(str(file_path))

    if image is None:
        raise ValueError("Unable to read the image file.")

    # Convert to grayscale
    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    # Improve text visibility
    processed = cv2.threshold(
        gray,
        0,
        255,
        cv2.THRESH_BINARY + cv2.THRESH_OTSU
    )[1]

    # OCR
    ocr_result = ocr_reader.readtext(
        processed,
        detail=0,
        paragraph=True
    )

    return "\n".join(ocr_result).strip()


def extract_text(file_path):
    file_path = Path(file_path)
    extension = file_path.suffix.lower()

    if extension == ".pdf":
        return extract_from_pdf(file_path)

    elif extension == ".docx":
        return extract_from_docx(file_path)

    elif extension in [".jpg", ".jpeg", ".png"]:
        return extract_from_image(file_path)

    elif extension == ".txt":
        return file_path.read_text(
            encoding="utf-8"
        ).strip()

    else:
        raise ValueError(
            f"Unsupported file format for text extraction: {extension}"
        )