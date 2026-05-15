# Feature Brief: F12-F17 Document Management

Goal:
- Add secure PDF upload, text extraction, document CRUD, ownership validation, pagination, and Free vs Pro limits.

In scope:
- Multer PDF upload.
- MIME, extension, magic-byte, and plan file-size validation.
- Text extraction with `pdf-parse`.
- Temporary upload cleanup after success or extraction failure.
- Document metadata and extracted text persistence.
- Owner-scoped list, detail, update, and delete APIs.
- Pagination and sorting.
- Free plan document count and file-size enforcement.
- Pro plan larger file-size support and unlimited document count.

Out of scope:
- AI summarization.
- AI chat.
- Frontend upload UI.
- PDF file download or permanent binary storage.

Acceptance:
- Valid digital PDFs upload and extract text.
- Non-PDF files are rejected.
- Invalid PDFs are rejected and cleaned up.
- Free users are limited to configured document count and file size.
- Pro users can upload files within the Pro size limit.
- Cross-user read, update, and delete attempts return 404.
- List endpoint supports empty and paginated result sets.
- `npm run check` passes.

