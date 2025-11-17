const pool = require('../db/connection');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

// --- CRITICAL SECURITY STEP: WHITELIST OF ALLOWED VIEWS ---
// Only views in this list can be queried dynamically.
const ALLOWED_VIEWS = new Set([
    "customer_order_summary",
    "high_rated_products",
    "above_average_sales",
    "customers_orders",
    "pending_payments",
    "low_stock_products",
    "category_wise_sales",
    "most_reliable_suppliers",
    "product_performance",
    "payment_summary"
]);

/**
 * Executes a SELECT * query on a whitelisted SQL view name provided in the URL.
 * GET /api/views/:viewName
 */
exports.getViewData = async (req, res) => {
    const { viewName } = req.params;

    // 1. Security Check: Validate the view name against the whitelist
    if (!ALLOWED_VIEWS.has(viewName)) {
        return res.status(400).json({ 
            success: false, 
            error: `Invalid view name: ${viewName}. View not found or not permitted.` 
        });
    }

    try {
        // 2. Execute the dynamic query using the trusted viewName
        // NOTE: Dynamic table/view names are safe here because they are hardcoded 
        // in the ALLOWED_VIEWS Set and not supplied directly by the client.
        const query = `SELECT * FROM ${viewName}`; 
        const [rows] = await pool.query(query);

        res.json({ 
            success: true, 
            view: viewName,
            count: rows.length, 
            data: rows 
        });

    } catch (err) {
        console.error(`Error fetching data for view ${viewName}:`, err.message || err);
        res.status(500).json({ 
            success: false, 
            error: `Failed to execute view query for ${viewName}.` 
        });
    }
};

// ------------------------------------------------------------------
// --- Export Functions (Skeletons based on productController.js) ---
// ------------------------------------------------------------------

/**
 * Exports the data for the specified view to CSV format.
 * GET /api/views/export/:viewName/csv
 */
exports.exportViewCSV = async (req, res) => {
    const { viewName } = req.params;

    if (!ALLOWED_VIEWS.has(viewName)) {
        return res.status(400).json({ success: false, message: "Invalid view name." });
    }

    try {
        const query = `SELECT * FROM ${viewName}`;
        const [results] = await pool.query(query);

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: `No data found for view: ${viewName}` });
        }
        
        // Use the column names from the first result object as fields
        const fields = Object.keys(results[0]);
        const parser = new Parser({ fields });
        const csv = parser.parse(results);

        res.header('Content-Type', 'text/csv');
        res.attachment(`${viewName}_report.csv`);
        res.send(csv);

    } catch (err) {
        console.error(`Error exporting view ${viewName} CSV:`, err.message || err);
        res.status(500).json({ success: false, message: 'Failed to export CSV' });
    }
};

/**
 * Exports the data for the specified view to PDF format.
 * GET /api/views/export/:viewName/pdf
 */
exports.exportViewPDF = async (req, res) => {
    const { viewName } = req.params;
    
    if (!ALLOWED_VIEWS.has(viewName)) {
        return res.status(400).json({ success: false, message: "Invalid view name." });
    }

    try {
        const query = `SELECT * FROM ${viewName}`;
        const [results] = await pool.query(query);

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: `No data found for view: ${viewName}` });
        }

        const doc = new PDFDocument({ margin: 30, size: "A4", layout: 'landscape' }); // Use landscape for wide tables

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=${viewName}_report.pdf`);

        doc.pipe(res);

        // --- PDF Generation Logic ---
        
        // Helper function to format view name
        const formatTitle = (name) => name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

        // Title
        doc.fontSize(16).font("Helvetica-Bold").text(`${formatTitle(viewName)} Report`, { align: "center" });
        doc.moveDown(0.5);
        doc.fontSize(10).font("Helvetica").text(`Total Records: ${results.length}`, { align: "center" });
        doc.moveDown(1);
        
        // Simplified Table Logic (PDF generation is complex, this is a simplified example)
        
        const tableTop = doc.y;
        const columnKeys = Object.keys(results[0]);
        const columnCount = columnKeys.length;
        
        // Calculate dynamic column width based on A4 landscape width (792 - 60 margin)
        const totalWidth = 732;
        const colWidth = totalWidth / columnCount;
        const rowHeight = 30;

        doc.fontSize(10); // Smaller font for many columns
        let y = tableTop;

        // Header Row
        doc.rect(30, y, totalWidth, rowHeight).fill("#343a40");
        doc.fillColor("white").font("Helvetica-Bold");

        let currentX = 30;
        columnKeys.forEach(key => {
            const headerText = formatTitle(key);
            doc.text(headerText, currentX + 3, y + 7, { width: colWidth - 6, align: 'left', ellipsis: true });
            currentX += colWidth;
        });
        y += rowHeight;

        // Data Rows
        doc.font("Helvetica").fillColor("black");

        results.forEach((row, index) => {
            // Page Break Check (A4 landscape body stops around y=550)
            if (y > 540) {
                doc.addPage({ layout: 'landscape' });
                y = tableTop;
                
                // Redraw Header on new page
                doc.rect(30, y, totalWidth, rowHeight).fill("#343a40");
                doc.fillColor("white").font("Helvetica-Bold");
                currentX = 30;
                columnKeys.forEach(key => {
                    const headerText = formatTitle(key);
                    doc.text(headerText, currentX + 3, y + 7, { width: colWidth - 6, align: 'left', ellipsis: true });
                    currentX += colWidth;
                });
                y += rowHeight;
                doc.font("Helvetica").fillColor("black");
            }

            // Alternating colors
            const bgColor = index % 2 === 0 ? "#fafafa" : "white";
            doc.rect(30, y, totalWidth, rowHeight).fill(bgColor).fillColor("black");

            currentX = 30;
            columnKeys.forEach(key => {
                let val = row[key];
                
                // Simple Date Handling: Convert Date objects to local date string
                if (val instanceof Date) {
                    val = val.toLocaleDateString();
                } else if (typeof val === 'number' && key.includes('price')) {
                    // Simple currency format for price/amount columns
                    val = `$${val.toFixed(2)}`;
                } else if (val === null || val === undefined) {
                    val = '—';
                }
                
                doc.text(String(val), currentX + 3, y + 7, { width: colWidth - 6, align: 'left', ellipsis: true });
                currentX += colWidth;
            });
            y += rowHeight;
        });

        doc.end();

    } catch (err) {
        console.error(`Error exporting view ${viewName} PDF:`, err.message || err);
        res.status(500).json({ success: false, message: 'Failed to export PDF' });
    }
};