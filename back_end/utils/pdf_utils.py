from PyPDF2 import PdfReader

def extract_text_from_pdf(pdf_file_path):
    text = ''
    with open(pdf_file_path, 'rb') as file:
        reader = PdfReader(file)
        for page in reader.pages:
            text += page.extract_text() or ''
    return text