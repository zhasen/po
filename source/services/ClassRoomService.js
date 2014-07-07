

//classRoom.mode
//1 等待 2 答题 3 讲解

var classRooms = {};

module.exports = function (ws, data) {
    var result = {};
    var json = JSON.parse(data);
    switch(json.method){
        case 'init':{
            ws.role = json.role;
            ws.userID = json.userID;
            ws.classCode = json.classCode;
            var classRoom = classRooms[json.classCode];
            if(!classRoom){
                classRoom = {};
                classRoom.mode = 1;
                classRoom.students = {};
                classRooms[json.classCode] = classRoom;
            }

            if(json.role == 1){
                classRoom.students[json.userID] = ws;
                switch (classRoom.mode){
                    case 1:{
                        result.method = 'wait';
                        ws.send(JSON.stringify(result));
                        break;
                    }
                    case 2:{
                        result.method = 'answer';
                        ws.send(JSON.stringify(result));
                        break;
                    }
                    case 3:{
                        result.method = 'explain';
                        ws.send(JSON.stringify(result));
                        break;
                    }
                }
            }
            else if(json.role == 2){
                classRoom.teacher = ws;
            }

            break;
        }
        case 'close':{
            var classRoom = classRooms[json.classCode];
            if(classRoom){
                if(json.role == 1){

                }
                else if(json.role == 2){

                }
            }

            break;
        }
        default :{
            return;
        }
    }
};
