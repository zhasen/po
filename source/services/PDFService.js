var PDFDocument = require('pdfkit');
var fs = require('fs');
var Service = {};

/**
 * 根据整理课表数据并下载
 * @param filename pdf文件名字
 * @param events 日历数据
 * @param classData 班级数据
 */
Service.generatePDF = function (filename, events, classData, callback) {
    var path = 'public/upload/schedule/' + filename + '.pdf';
    var doc = new PDFDocument;
    doc.font('public/upload/schedule/fonts/msyh.ttf'); // 微软雅黑
//    console.info('generatePDF:' + JSON.stringify(data));
    console.info('classData:');
    console.info(classData);
    events.forEach(function (e) {
        doc.fontSize(12).text(e.TeacherName + ' ' + e.ClassName + ' ' + e.SectBegin + ' ' + e.SectEnd + ' ' + e.PrintAdress);
    });
    var stream = doc.pipe(fs.createWriteStream(path)); // doc.pipe(res)
    doc.end();
    stream.once('close', function () {
        fs.exists(path, function () {
            callback(null, path);
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
