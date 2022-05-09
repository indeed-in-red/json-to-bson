const parse = (data, path = []) => {
    var _data = path.reduce((o, n) => o[n], data);

    for (const key in _data) {
        if (typeof (_data[key]) == 'object') {
            var _path = [...path, key];
            parse(data, _path);
        } else {
            switch (key) {
                case "$ref":
                    let url = _data[key];

                    info('Downloading ' + url);

                    var xhttp = new XMLHttpRequest();
                    xhttp.open("GET", url, false);
                    xhttp.send();

                    if (xhttp.status == 200 || xhttp.status == 304) {
                        var body = xhttp.responseText;

                        var refdata = JSON.parse(body);

                        refdataparsed = parse(refdata);

                        var sub = path.pop();
                        var location = path.reduce((o, n) => o[n], data);

                        location[sub] = refdataparsed
                    }

                    else {
                        error('can\'t reach ' + url + ' at $ref ' + sub);
                    }

                    break;

                case "type":
                    var location = path.reduce((o, n) => o[n], data);
                    location["bsonType"] = location[key];
                    delete location[key];
                    break;
                
                case "format":
                    var location = path.reduce((o, n) => o[n], data);
                    const regex = {
                        "datetime" : "^\\d{4}-(((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01]))|((0[469]|11)-(0[1-9]|[12][0-9]|30))|(02-(0[1-9]|[12][0-9])))T(([01][0-9])|(2[0-3])):[0-5][0-9]:[0-5][0-9]$",
                        "date": "^\\d{4}-(((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01]))|((0[469]|11)-(0[1-9]|[12][0-9]|30))|(02-(0[1-9]|[12][0-9])))$",
                        "email": "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$"
                    }    
                    var format = _data[key];
                    delete location[key];
                    location["pattern"] = regex[format];
                    break;

                case "$id":
                case "$schema":
                    var location = path.reduce((o, n) => o[n], data);
                    delete location[key];
                    break;
            }
        }
    }

    return data;
}

const main = () => {
    var url = document.getElementById('url').value;

    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", url, false);
    xhttp.send();

    if (xhttp.status == 200 || xhttp.status == 304) {
        var data = JSON.parse(xhttp.responseText);

        parse(data);

        success('Saving on your computer...');

        save(JSON.stringify(data), "output.json");
    }

    else {
        error('can\'t reach ' + url);
    }
}

const save = (data, filename, type = "application/json") => {
    var file = new Blob([data], { type: type });
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
            url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}

const error = (err) => {
    document.getElementById('message').innerHTML = `<err>Error : ${err}</err>`;
}

const success = (txt) => {
    document.getElementById('message').innerHTML = `<success>Done ! ${txt}</success>`;
}

const info = (inf) => {
    document.getElementById('message').innerHTML = inf;
}
