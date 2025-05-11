import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { NotoSans } from "../assets/fonts/NotoSans";

interface Customer {
    customerPhone: string;
    customerName: string;
    seatNumber: number;
    pickupLocation: string;
    dropoffLocation: string;
}

const initFont = (doc: jsPDF) => {
    doc.addFileToVFS("NotoSans.ttf", NotoSans);
    doc.addFont("NotoSans.ttf", "NotoSans", "normal");
    doc.setFont("NotoSans");
};

export const generateCustomerListPDF = (
    customers: Customer[],
    scheduleId: string
) => {
    const doc = new jsPDF("landscape", "mm", "a4"); // A4 ngang
    const timestamp = new Date().toLocaleString("vi-VN").split(",")[0];

    initFont(doc);

    // Header
    doc.setFillColor(25, 118, 210);
    doc.rect(0, 0, 297, 30, "F"); // 297 = A4 ngang

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text("DANH SÁCH KHÁCH HÀNG", 148.5, 15, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Mã chuyến: ${scheduleId}`, 148.5, 25, { align: "center" });

    // Timestamp
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Ngày xuất: ${timestamp}`, 287, 35, { align: "right" });

    const tableColumn = [
        "Họ và tên",
        "Số điện thoại",
        "Số ghế",
        "Điểm đón",
        "Điểm trả",
    ];

    const tableRows = customers.map((customer) => [
        customer.customerName,
        customer.customerPhone,
        customer.seatNumber.toString(),
        customer.pickupLocation,
        customer.dropoffLocation,
    ]);

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        theme: "grid",
        styles: {
            font: "NotoSans",
            fontSize: 9,
            cellPadding: 3,
            overflow: "linebreak",
        },
        headStyles: {
            fillColor: [25, 118, 210],
            textColor: 255,
            fontStyle: "bold",
            halign: "center",
        },
        columnStyles: {
            0: { cellWidth: 60 }, // Họ và tên
            1: { cellWidth: 35, halign: "center" }, // Số điện thoại
            2: { cellWidth: 20, halign: "center" }, // Số ghế
            3: { cellWidth: 85 }, // Điểm đón
            4: { cellWidth: 85 }, // Điểm trả
        },
        didDrawPage: (data) => {
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text(`Trang ${data.pageNumber}`, 10, doc.internal.pageSize.height - 10);
            doc.text(
                `© ${new Date().getFullYear()} TicketGo`,
                doc.internal.pageSize.width / 2,
                doc.internal.pageSize.height - 10,
                { align: "center" }
            );
        },
        willDrawCell: (data) => {
            if (data.row.index % 2 === 0 && data.section === "body") {
                data.cell.styles.fillColor = [245, 245, 245];
            }
        },
        margin: { top: 40, bottom: 20, left: 10, right: 10 },
    });

    const formattedDate = new Date()
        .toLocaleString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        })
        .replace(/[/:]/g, "-");

    doc.save(`DS-Khach-Hang-Chuyen-${scheduleId}-${formattedDate}.pdf`);
};
