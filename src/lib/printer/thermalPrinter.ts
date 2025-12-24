/**
 * Marklife Thermal Printer D100 Web Bluetooth Interface
 *
 * This utility provides functions to connect and print to the Marklife D100 thermal printer
 * using Web Bluetooth API
 */

export interface PrintData {
  schoolName: string;
  studentName: string;
  studentPhone: string;
  guardianPhone: string;
  previousSchool: string;
  admissionYear: number;
  gender: string;
  uniformItems: {
    season: string;
    name: string;
    size: number;
    customization: string;
    quantity: number;
  }[];
  supplyItems: {
    name: string;
    size: string;
    quantity: number;
  }[];
}

class ThermalPrinter {
  private device: BluetoothDevice | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;

  /**
   * Connect to the Marklife D100 printer via Bluetooth
   */
  async connect(): Promise<boolean> {
    try {
      // Request Bluetooth device
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { name: "D100" },
          { namePrefix: "Marklife" },
          { services: ["000018f0-0000-1000-8000-00805f9b34fb"] }, // Common printer service
        ],
        optionalServices: [
          "000018f0-0000-1000-8000-00805f9b34fb",
          "49535343-fe7d-4ae5-8fa9-9fafd205e455", // Another common service
        ],
      });

      if (!this.device.gatt) {
        throw new Error("GATT not available");
      }

      // Connect to GATT server
      const server = await this.device.gatt.connect();

      // Get the primary service (try multiple service UUIDs)
      let service;
      try {
        service = await server.getPrimaryService(
          "000018f0-0000-1000-8000-00805f9b34fb"
        );
      } catch {
        service = await server.getPrimaryService(
          "49535343-fe7d-4ae5-8fa9-9fafd205e455"
        );
      }

      // Get the characteristic for writing
      const characteristics = await service.getCharacteristics();
      this.characteristic =
        characteristics.find((c) => c.properties.write) || characteristics[0];

      return true;
    } catch (error) {
      console.error("Failed to connect to printer:", error);
      throw new Error(
        "프린터 연결에 실패했습니다. 프린터가 켜져있고 페어링 모드인지 확인해주세요."
      );
    }
  }

  /**
   * Disconnect from the printer
   */
  disconnect() {
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect();
    }
    this.device = null;
    this.characteristic = null;
  }

  /**
   * Check if printer is connected
   */
  isConnected(): boolean {
    return this.device?.gatt?.connected || false;
  }

  /**
   * Send raw data to printer
   */
  private async sendData(data: Uint8Array): Promise<void> {
    if (!this.characteristic) {
      throw new Error("프린터가 연결되지 않았습니다.");
    }

    // Split data into chunks of 20 bytes (Bluetooth limitation)
    const chunkSize = 20;
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      await this.characteristic.writeValue(chunk);
      // Small delay between chunks
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  /**
   * Send text to printer
   */
  private async printText(text: string, encoding: "utf-8" | "euc-kr" = "utf-8"): Promise<void> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    await this.sendData(data);
  }

  /**
   * Print ESC/POS commands
   */
  private async sendCommand(command: number[]): Promise<void> {
    await this.sendData(new Uint8Array(command));
  }

  /**
   * Initialize printer
   */
  private async initPrinter(): Promise<void> {
    // ESC @ - Initialize printer
    await this.sendCommand([0x1b, 0x40]);
  }

  /**
   * Set text alignment
   */
  private async setAlignment(align: "left" | "center" | "right"): Promise<void> {
    // ESC a n
    const alignValue = { left: 0, center: 1, right: 2 }[align];
    await this.sendCommand([0x1b, 0x61, alignValue]);
  }

  /**
   * Set text size
   */
  private async setTextSize(width: number, height: number): Promise<void> {
    // GS ! n
    const size = ((width - 1) << 4) | (height - 1);
    await this.sendCommand([0x1d, 0x21, size]);
  }

  /**
   * Set bold
   */
  private async setBold(bold: boolean): Promise<void> {
    // ESC E n
    await this.sendCommand([0x1b, 0x45, bold ? 1 : 0]);
  }

  /**
   * Feed lines
   */
  private async feedLines(lines: number): Promise<void> {
    // ESC d n
    await this.sendCommand([0x1b, 0x64, lines]);
  }

  /**
   * Cut paper
   */
  private async cutPaper(): Promise<void> {
    // GS V m - Full cut
    await this.sendCommand([0x1d, 0x56, 0x00]);
  }

  /**
   * Print a line separator
   */
  private async printSeparator(): Promise<void> {
    await this.printText("--------------------------------\n");
  }

  /**
   * Format and print receipt data
   */
  async printReceipt(data: PrintData): Promise<void> {
    if (!this.isConnected()) {
      throw new Error("프린터가 연결되지 않았습니다.");
    }

    try {
      // Initialize
      await this.initPrinter();

      // Header - centered and bold
      await this.setAlignment("center");
      await this.setBold(true);
      await this.setTextSize(2, 2);
      await this.printText("스마트학생복\n");
      await this.feedLines(1);

      // School name
      await this.setTextSize(1, 1);
      await this.printText(`${data.schoolName}\n`);
      await this.setBold(false);
      await this.feedLines(1);

      // Separator
      await this.setAlignment("left");
      await this.printSeparator();

      // Student information
      await this.setBold(true);
      await this.printText("학생 정보\n");
      await this.setBold(false);
      await this.printText(`출신학교: ${data.previousSchool}\n`);
      await this.printText(`입학학교: ${data.schoolName}(${data.admissionYear})\n`);
      await this.printText(`학생이름: ${data.studentName} (${data.gender})\n`);
      await this.printText(`연락처: ${data.studentPhone}\n`);
      await this.printText(`보호자: ${data.guardianPhone}\n`);
      await this.feedLines(1);

      await this.printSeparator();

      // Uniform items - grouped by season
      const winterItems = data.uniformItems.filter((item) => item.season === "동복");
      const summerItems = data.uniformItems.filter((item) => item.season === "하복");

      if (winterItems.length > 0) {
        await this.setBold(true);
        await this.printText("동복\n");
        await this.setBold(false);

        await this.printText("품목    사이즈  수량  맞춤\n");
        await this.printSeparator();

        for (const item of winterItems) {
          const name = item.name.padEnd(8, " ");
          const size = item.size.toString().padEnd(6, " ");
          const qty = item.quantity.toString().padEnd(4, " ");
          const custom = item.customization || "-";
          await this.printText(`${name}${size}${qty}${custom}\n`);
        }
        await this.feedLines(1);
      }

      if (summerItems.length > 0) {
        await this.setBold(true);
        await this.printText("하복\n");
        await this.setBold(false);

        await this.printText("품목    사이즈  수량  맞춤\n");
        await this.printSeparator();

        for (const item of summerItems) {
          const name = item.name.padEnd(8, " ");
          const size = item.size.toString().padEnd(6, " ");
          const qty = item.quantity.toString().padEnd(4, " ");
          const custom = item.customization || "-";
          await this.printText(`${name}${size}${qty}${custom}\n`);
        }
        await this.feedLines(1);
      }

      // Supply items
      if (data.supplyItems.length > 0) {
        await this.printSeparator();
        await this.setBold(true);
        await this.printText("용품\n");
        await this.setBold(false);

        await this.printText("품목        사이즈  수량\n");
        await this.printSeparator();

        for (const item of data.supplyItems) {
          const name = item.name.padEnd(12, " ");
          const size = item.size.padEnd(6, " ");
          const qty = item.quantity.toString();
          await this.printText(`${name}${size}${qty}\n`);
        }
        await this.feedLines(1);
      }

      // Footer
      await this.printSeparator();
      await this.setAlignment("center");
      await this.printText("교복과 함께\n");
      await this.printText("카운터에 안내해주세요\n");
      await this.feedLines(2);

      // Cut paper
      await this.cutPaper();
    } catch (error) {
      console.error("Print error:", error);
      throw new Error("프린트 중 오류가 발생했습니다.");
    }
  }
}

// Singleton instance
const thermalPrinter = new ThermalPrinter();

export default thermalPrinter;
