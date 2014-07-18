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
    schedule_title(doc, classData); // 课表pdf的title部分
    schedule_class(doc, classData); // 课表pdf的class列表部分
    schedule_week(doc, events); // 课表pdf的周日历部分
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

/**
 * 课表公共设置
 */
function schedule_common(doc) {
    doc.fontSize(12).font('public/upload/schedule/fonts/simfang.ttf'); // 微软雅黑
}

/**
 * 课表pdf的title部分
 */
function schedule_title(doc, classData) {
    doc.fontSize(18).font('public/upload/schedule/fonts/simhei.ttf').text(classData.SchoolId + 'test', {align: 'center'});
    doc.moveDown();
    schedule_common(doc);
    doc.text('姓名：' + 'xxx', {align: 'right'});
    doc.text('部门：' + 'xxx', {align: 'right'});
    doc.text('老师编号：' + 'xxx', {align: 'center'});
    doc.moveDown();
    doc.text('上课班级信息汇总：', {align: 'left'});
    doc.moveDown();
}

/**
 * 课表pdf的class列表部分
 */
function schedule_class(doc, classData) {
    schedule_common(doc);
    grid(doc, 'test', 100, 200, 300, 400);
}

/**
 * 课表pdf的周日历部分
 */
function schedule_week(doc, events) {
    events.forEach(function (e) {
        doc.fontSize(12).text(e.TeacherName + ' ' + e.ClassName + ' ' + e.SectBegin + ' ' + e.SectEnd + ' ' + e.PrintAdress);
    });
}

/**
 * 封装画格子
 * text(text, x, y, options) 写文字
 * rect(x, y, w, h) 画方格
 */
function grid(doc, text, x, y, w, h){
    doc.text(text, x, y);
    doc.rect(x, y, w, h).stroke();
//    doc.rect(doc.x, 0, 410, doc.y).stroke();
}

module.exports = Service;
