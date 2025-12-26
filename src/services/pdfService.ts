import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export interface MeasurementPDFData {
  studentData: {
    name: string;
    gender: string;
    birth_date: string;
    student_phone: string;
    guardian_phone: string;
    admission_year: number;
    admission_grade: number;
    school_name: string;
    address: string;
    delivery: boolean;
  };
  bodyMeasurements: {
    height: number;
    weight: number;
    shoulder: number;
    waist: number;
  };
  uniformItems: Array<{
    name: string;
    season: string;
    selectedSize: number;
    customization: string;
    purchaseCount: number;
  }>;
  supplyItems: Array<{
    name: string;
    category: string;
    size: string;
    quantity?: number;
  }>;
  measurementDate: string;
}

export class PDFGenerationService {
  /**
   * Generate PDF from HTML element
   */
  static async generatePDFFromElement(
    element: HTMLElement,
    filename: string = "measurement.pdf"
  ): Promise<Blob> {
    try {
      // Capture the HTML element as canvas
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      // Get canvas dimensions
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Create PDF
      const pdf = new jsPDF({
        orientation: imgHeight > imgWidth ? "portrait" : "landscape",
        unit: "mm",
        format: "a4",
      });

      // Convert canvas to image and add to PDF
      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      // Return as Blob
      return pdf.output("blob");
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw new Error("PDF 생성 중 오류가 발생했습니다.");
    }
  }

  /**
   * Download PDF directly to user's device
   */
  static async downloadPDF(element: HTMLElement, filename: string): Promise<void> {
    try {
      const pdfBlob = await this.generatePDFFromElement(element, filename);

      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      throw error;
    }
  }

  /**
   * Generate filename for measurement PDF
   */
  static generateFilename(studentName: string, schoolName: string): string {
    const date = new Date().toISOString().split("T")[0];
    const sanitizedName = studentName.replace(/[^a-zA-Z0-9가-힣]/g, "_");
    const sanitizedSchool = schoolName.replace(/[^a-zA-Z0-9가-힣]/g, "_");
    return `측정결과서_${sanitizedSchool}_${sanitizedName}_${date}.pdf`;
  }

  /**
   * Upload PDF to cloud storage and return shareable link
   * This will be called with the backend API
   */
  static async uploadToCloud(
    pdfBlob: Blob,
    studentId: number,
    filename: string
  ): Promise<string> {
    try {
      const formData = new FormData();
      formData.append("file", pdfBlob, filename);
      formData.append("studentId", studentId.toString());

      const response = await fetch("/api/v1/measurements/upload-pdf", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("PDF 업로드에 실패했습니다.");
      }

      const data = await response.json();
      return data.shareUrl; // Backend should return shareable URL
    } catch (error) {
      console.error("Error uploading PDF to cloud:", error);
      throw new Error("PDF 업로드 중 오류가 발생했습니다.");
    }
  }

  /**
   * Complete workflow: Generate PDF and upload to cloud
   */
  static async generateAndUpload(
    element: HTMLElement,
    studentId: number,
    studentName: string,
    schoolName: string
  ): Promise<string> {
    try {
      // Generate filename
      const filename = this.generateFilename(studentName, schoolName);

      // Generate PDF blob
      const pdfBlob = await this.generatePDFFromElement(element, filename);

      // Upload to cloud and get shareable link
      const shareUrl = await this.uploadToCloud(pdfBlob, studentId, filename);

      return shareUrl;
    } catch (error) {
      console.error("Error in PDF generation and upload workflow:", error);
      throw error;
    }
  }
}
