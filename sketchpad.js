//  sketchpad.js
//  Created by 许静宇.
var gl;
var points = [];
var line_Points = [];
var rectangle_Points = [];
var rec_X, rec_Y;
var circle_Points = [];
var circle_X = [], circle_Y = [];
var triangle_Points = [];
var triangle_X = [], triangle_Y = [];
var a_Position;
var u_Color;
var hasMove = false;
var canDraw = false;
var drawMode = 0;//0 point, 1 line, 2 rectangle, 3 circle, 4 triangle
var ver_num = 0;

window.onload = function init()
{
    changeCursor();
    var canvas = document.getElementById( "sketchpad-gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //  Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 0.9, 0.9, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    a_Position = gl.getAttribLocation( program, "a_Position" );

    u_Color = gl.getUniformLocation( program, "u_Color" );
    gl.uniform4f(u_Color, 0.0, 0.0, 0.0, 1.0);

    gl.clear( gl.COLOR_BUFFER_BIT );
};


function changeCursor()
{
    document.getElementById("sketchpad-gl-canvas").style.cursor="crosshair";
}

function mouseDown(event)
{
    canDraw = true;
    hasMove = false;
}

function mouseUp(event)
{
    switch(drawMode)
    {
        case 0: drawPoint(event); break;
        case 1: ver_num++; drawLine(event); break;
        case 2: ver_num++; drawRectangle(event); break;
        case 3: ver_num++; drawCircle(event); break;
        case 4: ver_num++; drawTriangle(event); break;
        default: break;
    }
    canDraw = false;
}

function mouseMove(event)
{
    hasMove = true;
    if(drawMode == 0 && canDraw)
        drawPoint(event);
}

function drawPoint(event)
{
    var c = document.getElementById("sketchpad-gl-canvas")
    var e = event || window.event;
    var x = e.clientX, y = e.clientY;
    var rect = event.target.getBoundingClientRect();

    x = (x - rect.left - c.width/2)/(c.width/2);
    y = (c.height/2 - (y - rect.top))/(c.height/2);
    points.push(x); points.push(y);

    var len = points.length;

    gl.clear( gl.COLOR_BUFFER_BIT );
    for(let i = 0; i < len; i += 2)
    {
        gl.vertexAttrib3f(a_Position, points[i], points[i+1], 0.0);
        gl.drawArrays(gl.POINTS, 0, 1);
    }
}

function drawLine(event)
{
    var c = document.getElementById("sketchpad-gl-canvas")
    var e = event || window.event;
    var x = e.clientX, y = e.clientY;
    var rect = event.target.getBoundingClientRect();
    x = (x - rect.left - c.width/2)/(c.width/2);
    y = (c.height/2 - (y - rect.top))/(c.height/2);
    line_Points.push(x); line_Points.push(y);
    var len = line_Points.length;
    if(ver_num % 2 == 0 && ver_num > 1)
    {
        gl.clear( gl.COLOR_BUFFER_BIT );
        var line_buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, line_buffer); gl.bufferData(gl.ARRAY_BUFFER, flatten(line_Points), gl.STATIC_DRAW);
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0); gl.enableVertexAttribArray(a_Position);
        for(let i = 0; i < len; i += 2)
        {
            gl.drawArrays(gl.LINES, i, 2);
        }
    }
}

function drawRectangle(event)
{
    var c = document.getElementById("sketchpad-gl-canvas")
    var e = event || window.event;
    var x = e.clientX, y = e.clientY;
    var rect = event.target.getBoundingClientRect();
    x = (x - rect.left - c.width/2)/(c.width/2);
    y = (c.height/2 - (y - rect.top))/(c.height/2);
    if(ver_num % 2 == 1)
    {
        rec_X = x; rec_Y = y;
        rectangle_Points.push(x); rectangle_Points.push(y);
    }
    if(ver_num % 2 == 0 && ver_num > 1)
    {
        points.length = 0;
        rectangle_Points.push(x); rectangle_Points.push(rec_Y);
        rectangle_Points.push(x); rectangle_Points.push(rec_Y);
        rectangle_Points.push(x); rectangle_Points.push(y);
        rectangle_Points.push(x); rectangle_Points.push(y);
        rectangle_Points.push(rec_X); rectangle_Points.push(y);
        rectangle_Points.push(rec_X); rectangle_Points.push(y);
        rectangle_Points.push(rec_X); rectangle_Points.push(rec_Y);

        gl.clear( gl.COLOR_BUFFER_BIT );

        var rectangle_buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, rectangle_buffer); gl.bufferData(gl.ARRAY_BUFFER, flatten(rectangle_Points), gl.STATIC_DRAW);
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0); gl.enableVertexAttribArray(a_Position);

        var len = rectangle_Points.length;

        for(let i = 0; i < len; i += 2)
        {
            gl.drawArrays(gl.LINE_LOOP, i, 2);
        }
    }
}

function drawCircle(event)
{
    var c = document.getElementById("sketchpad-gl-canvas")
    var e = event || window.event;
    var x = e.clientX, y = e.clientY;
    var rect = event.target.getBoundingClientRect();
    if(ver_num % 2 == 1)//meaning that center of circle is placed
    { circle_X.push(x); circle_Y.push(y); }
    if(ver_num % 2 == 0 && ver_num > 1)
    {
        points.length = 0;
        var radius = Math.sqrt((circle_X[ver_num / 2 - 1] - x) * (circle_X[ver_num / 2 - 1] - x) + (circle_Y[ver_num / 2 - 1] - y) * (circle_Y[ver_num / 2 - 1] - y));
        for(let i = 0; i <= 360; i++)
        {
            x = circle_X[ver_num / 2 - 1] + radius * Math.cos(Math.PI*i/180);
            y = circle_Y[ver_num / 2 - 1] + radius * Math.sin(Math.PI*i/180);
            x = (x - rect.left - c.width/2)/(c.width/2);
            y = (c.height/2 - (y - rect.top))/(c.height/2);
            if(i != 0 && i != 360)
            {
                circle_Points.push(x);
                circle_Points.push(y);
            }
            circle_Points.push(x);
            circle_Points.push(y);
        }

        gl.clear( gl.COLOR_BUFFER_BIT );

        var circle_buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, circle_buffer); gl.bufferData(gl.ARRAY_BUFFER, flatten(circle_Points), gl.STATIC_DRAW);
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0); gl.enableVertexAttribArray(a_Position);

        var len = circle_Points.length;

        for(let i = 0; i < len; i += 2)
        {
            gl.drawArrays(gl.LINE_LOOP, i, 2);
        }
    }
}

function drawTriangle(event)
{
    var c = document.getElementById("sketchpad-gl-canvas")
    var e = event || window.event;
    var x = e.clientX, y = e.clientY;
    var rect = event.target.getBoundingClientRect();
    x = (x - rect.left - c.width/2)/(c.width/2);
    y = (c.height/2 - (y - rect.top))/(c.height/2);
    if(ver_num % 3 != 0)
    {
        triangle_X[ver_num % 3 - 1] = x; triangle_Y[ver_num % 3 - 1] = y;
        triangle_Points.push(x); triangle_Points.push(y);
    }
    if(ver_num % 3 == 0 && ver_num > 1)
    {
        points.length = 0;
        triangle_Points.push(triangle_X[1]); triangle_Points.push(triangle_Y[1]);
        triangle_Points.push(x); triangle_Points.push(y);
        triangle_Points.push(x); triangle_Points.push(y);
        triangle_Points.push(triangle_X[0]); triangle_Points.push(triangle_Y[0]);


        gl.clear( gl.COLOR_BUFFER_BIT );

        var triangle_buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, triangle_buffer); gl.bufferData(gl.ARRAY_BUFFER, flatten(triangle_Points), gl.STATIC_DRAW);
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0); gl.enableVertexAttribArray(a_Position);

        var len = triangle_Points.length;

        for(let i = 0; i < len; i += 2)
        {
            gl.drawArrays(gl.LINE_LOOP, i, 2);
        }
    }
}

function ShapeClicked()
{
    var len = document.shapeSelect.elements.length;
    for(let i = 0; i < len; i++)
    {
        if(document.shapeSelect.elements[i].value == "point" && document.shapeSelect.elements[i].checked)
        {
            drawMode = 0; 
            Clear();
        }
        if(document.shapeSelect.elements[i].value == "line" && document.shapeSelect.elements[i].checked)
        {
            drawMode = 1; 
            Clear();
        }
        if(document.shapeSelect.elements[i].value == "rectangle" && document.shapeSelect.elements[i].checked)
        {
            drawMode = 2; 
            Clear();
        }
        if(document.shapeSelect.elements[i].value == "circle" && document.shapeSelect.elements[i].checked)
        {
            drawMode = 3; 
            Clear();
        }
        if(document.shapeSelect.elements[i].value == "triangle" && document.shapeSelect.elements[i].checked)
        {
            drawMode = 4; 
            Clear();
        }
    }
}

function ColorClicked()
{
    var len = document.colorSelect.elements.length;
    for(let i = 0; i < len; i++)
    {
        if(document.colorSelect.elements[i].value == "black" && document.colorSelect.elements[i].checked)
        {
            gl.uniform4f(u_Color, 0.0, 0.0, 0.0, 1.0);
        }
        if(document.colorSelect.elements[i].value == "white" && document.colorSelect.elements[i].checked)
        {
            gl.uniform4f(u_Color, 1.0, 1.0, 1.0, 1.0);
        }
        if(document.colorSelect.elements[i].value == "red" && document.colorSelect.elements[i].checked)
        {
            gl.uniform4f(u_Color, 1.0, 0.0, 0.0, 1.0);
        }
        if(document.colorSelect.elements[i].value == "pink" && document.colorSelect.elements[i].checked)
        {
            gl.uniform4f(u_Color, 1.0, 0.75, 0.796, 1.0);
        }
        if(document.colorSelect.elements[i].value == "yellow" && document.colorSelect.elements[i].checked)
        {
            gl.uniform4f(u_Color, 1.0, 1.0, 0.0, 1.0);
        }
        if(document.colorSelect.elements[i].value == "green" && document.colorSelect.elements[i].checked)
        {
            gl.uniform4f(u_Color, 0.0, 0.5, 0.0, 1.0);
        }
        if(document.colorSelect.elements[i].value == "blue" && document.colorSelect.elements[i].checked)
        {
            gl.uniform4f(u_Color, 0.0, 0.0, 1.0, 1.0);
        }
        if(document.colorSelect.elements[i].value == "purple" && document.colorSelect.elements[i].checked)
        {
            gl.uniform4f(u_Color, 0.5, 0.0, 0.5, 1.0);
        }
    }
}

function Clear()
{
    gl.clearColor( 0.9, 0.9, 0.9, 1.0 );
    gl.clear( gl.COLOR_BUFFER_BIT );
    points.length = 0;
    line_Points.length = 0;
    rectangle_Points.length = 0;
    circle_Points.length = 0;
    ver_num = 0;
    circle_X.length = 0;
    circle_Y.length = 0;
    triangle_Points.length = 0;
}