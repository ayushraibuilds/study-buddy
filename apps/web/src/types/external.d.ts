declare module "pdf-parse" {
  export default function pdfParse(
    data: ArrayBuffer | Uint8Array,
  ): Promise<{ text: string }>;
}
