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
    //schedule_week(doc, events); // 课表pdf的周日历部分
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
 * 课表pdf的title部分
 */
function schedule_title(doc, classData) {
    doc.fontSize(18).font('public/upload/schedule/fonts/simhei.ttf');
    doc.text(classData.SchoolId + 'test', {align: 'center'});
    doc.moveDown();
    doc.fontSize(12).font('public/upload/schedule/fonts/simfang.ttf');
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
    // console.info('doc: '); console.info(doc);
    doc.fontSize(10).font('public/upload/schedule/fonts/simfang.ttf'); // 微软雅黑
    var x = doc.page.margins.left, y = 200; // class列表部分起始的位置
    var paddingTop = 5, paddingLeft = 1, align = 'center'; // 格子中padding距离, 文字位置
    var h1 = 25, h2 = 50; // 两行格子的高度
    var data = [
        {order: 0, name: '班级编码', value: classData.ClassCode},
        {order: 1, name: '班级名称', value: classData.ClassName},
        {order: 2, name: '班级上课地点', value: classData.PrintAddress},
        {order: 3, name: '班级上课时间', value: classData.PrintTime},
        {order: 4, name: '开/结课时间', value: classData.poBeginDate + ' ' + classData.poEndDate},
        {order: 5, name: '课程名称', value: ''},
        {order: 6, name: '已排课次', value: ''}
    ]
    var w = (doc.page.width - doc.page.margins.left - doc.page.margins.right) / data.length; // 格子的宽度
    data.forEach(function (item) {
        grid(doc, item.name, x + item.order * w, y, w, h1, paddingTop, paddingLeft, align);
        grid(doc, item.value, x + item.order * w, y + h1, w, h2, paddingTop, paddingLeft, align);
    });

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
 * 部分默认对象属性
 * doc.page.margins: { top: 72, left: 72, bottom: 72, right: 72 }
 * doc.page.width: 612
 * doc.page.height: 792
 * @param doc
 * @param text
 * @param x 左上角x坐标
 * @param y 左上角y坐标
 * @param w 格子的宽度
 * @param h 格子的高度
 * @param paddingTop 格子中padding-top的距离
 * @param indent 格子中padding-left的距离
 * @param textAlign 文字位置：left right center justify
 */
function grid(doc, text, x, y, w, h, paddingTop, indent, textAlign) {
    doc.text(text, x, y + paddingTop, {width: w, indent: indent, align: textAlign});
    doc.rect(x, y, w, h).lineWidth(0.5).stroke();
}

module.exports = Service;
