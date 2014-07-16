var PDFDocument = require('pdfkit');
var fs = require('fs');
var Service = {};

/**
 * 根据整理课表数据并下载
 * @param param 参数
 */
Service.generatePDF = function (param, callback) {
    var filename = 'public/upload/schedule/output.pdf';
    var doc = new PDFDocument;
    // doc.pipe(res); // 把流输出到应答
    doc.fontSize(25).text('Some text with an embedded font!', 100, 100);
    doc.addPage()
        .fontSize(25)
        .text('Here is some vector graphics...', 100, 100);
    doc.save()
        .moveTo(100, 150)
        .lineTo(100, 250)
        .lineTo(200, 250)
        .fill("#FF3300");
    doc.scale(0.6)
        .translate(470, -380)
        .path('M 250,75 L 323,301 131,161 369,161 177,301 z')
        .fill('red', 'even-odd')
        .restore();
    doc.addPage()
        .fillColor("blue")
        .text('Here is a link!', 100, 100)
        .underline(100, 100, 160, 27, {color: "#0000FF"})
        .link(100, 100, 160, 27, 'http://google.com/');
    var stream = doc.pipe(fs.createWriteStream(filename));
    doc.end();
    stream.once('close', function () {
        fs.exists(filename, function () {
            callback(null, filename);
        });
    });
};

/**
 * 删除pdf文件，用于在下载后删掉pdf
 */
Service.deletePDF = function (path, callback) {
    fs.unlink(path, callback);
};

module.exports = Service;
