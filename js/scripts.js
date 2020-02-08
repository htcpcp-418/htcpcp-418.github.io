var schedule, tds, lessons, thDay, spDt;
var startDate, zeroWeekN, textWeek, week, weekC, currW, cWDate, dayI;
var selC = "#ffff00", selCd = "#7fc7ff";


window.onload = init;
window.onhashchange = init;

function init()
{
	if(window.location.hash == "")
		document.body.innerHTML = '<h1 align="center" width=100%>В конце URL должен быть написан \"#\" и код группы. Как создать xml файл можно <a href="howto.html">тут</a></h1>';
	else
	{
		var hash = (window.location.hash.replace("#", "")).toLowerCase();
		if(hash.search(/[\\\/:\*\?"<>\|\+\.%\!@]/g) == -1)
			getXml(hash);
		else
			document.body.innerHTML = "<h1 align='center' width=100%>В конце URL должен быть написан \"#\" и код группы.<br>Неверный формат URL.</h1>";
	}
}

function getXml(filename)
{
	var xmlHTTP = new XMLHttpRequest();
	xmlHTTP.onreadystatechange = function()
	{
		if(xmlHTTP.readyState == 4)
		{
			if(xmlHTTP.status == 200)
				startWork(xmlHTTP.responseXML);
			else
			{
				document.title = xmlHTTP.status + " - " + xmlHTTP.statusText;
				document.body.innerHTML = "<h1 align='center' width=100%>" + xmlHTTP.status + "<br>" + xmlHTTP.statusText + "</h1>";
			}
		}
	};
	xmlHTTP.open("GET", "xml/" + filename + ".xml", true);
	xmlHTTP.send(null);
}

function startWork(doc)
{
	document.title = "Расписание";
	document.body.innerHTML = '<h1 id="weekN" align="center"></h1>';
	document.body.innerHTML += readSchedule(doc);
	create_control();
	
	setupDraw();
	
	currWeek();
}

function readSchedule(doc)
{
	schedule = doc.getElementsByTagName("schedule")[0];
	
	var times = schedule.getElementsByTagName("time");
	var days;
	var subject;
	var classrooms;
	var less;
	
	var temp;
	
	var table;
	
	table = '<table id="sched" cellspacing="0" align="center" cellpadding="10" border="5">';
	table += '<tr><th colspan="2"></th><th>Предмет</th><th>Тип пары (часы)</th><th>Недели</th><th>Аудитория</th></tr>';
	
	for(var i0 = 0; i0 < times.length; i0++)
	{
		days = times[i0].getElementsByTagName("day");
		table += '<tr><th class="r90 tm" rowspan="' + (times[i0].getElementsByTagName("lesson").length + days.length + (i0 == 0? -1 : 0)) + '"><span>' + times[i0].getAttribute("value") + '</span></th>';
		
		for(var i1 = 0; i1 < days.length; i1++)
		{
			if(i1 > 0 || i0 > 0)
			{
				if(i1 > 0)
					table += '<tr><td colspan="5" class="emp"></td></tr><tr>';
				else
					table += '<td colspan="5" class="emp"></td></tr><tr>';
			}
			
			table += '<th class="r90"';
			
			if((temp = days[i1].getElementsByTagName("lesson").length) > 1)
				table += ' rowspan="' + temp + '"';
				
			table += '><span>' + days[i1].getAttribute("value") + '<br><span class="dt"></span></span></th>';
			
			subject = days[i1].getElementsByTagName("subject");
			for(var i2 = 0; i2 < subject.length; i2++)
			{
				table += '<td';
				
				if((temp = subject[i2].getElementsByTagName("lesson").length) > 1)
					table += ' rowspan="' + temp + '"';
					
				table += '>' + subject[i2].getAttribute("value");
				
				if(subject[i2].hasAttribute("teacher"))
					table += '<br><span class="teach">' + subject[i2].getAttribute("teacher") + '</span>';
				if(subject[i2].hasAttribute("comment"))
					table += '<br><span class="comm">' + subject[i2].getAttribute("comment") + '</span>';
				
				table += '</td>';
				
				classrooms = subject[i2].getElementsByTagName("classroom");
				for(var i3 = 0; i3 < classrooms.length; i3++)
				{
					less = classrooms[i3].getElementsByTagName("lesson");
					
					for(var i4 = 0; i4 < less.length; i4++)
					{
						table += '<td>' + less[i4].getAttribute("type");
						
						if(less[i4].hasAttribute("teacher"))
							table += '<br><span class="teach">' + less[i4].getAttribute("teacher") + '</span>';
						if(less[i4].hasAttribute("comment"))
							table += '<br><span class="comm">' + less[i4].getAttribute("comment") + '</span>';
				
						table += '</td><td>' + less[i4].getAttribute("weeks") + '</td>';
						
						if(i4 == 0)
						{
							table += '<td';
							
							if((temp = less.length) > 1)
								table += ' rowspan="' + temp + '"';
							
							table += '>' + classrooms[i3].getAttribute("value") + '</td>';
						}
						
						table += '</tr>';
						if(i4 < less.length - 1 || i3 < classrooms.length - 1 || i2 < subject.length - 1)
							table += '<tr>';
					}
				}
			}
		}
	}
	
	table += '</table>';
	
	return table;
}

function setupDraw()
{
	var tmp;
	var sched_table = document.getElementById("sched");
	
	startDate = new Date(((tmp = schedule.getAttribute("year")) == null? 2018 : +tmp), ((tmp = schedule.getAttribute("month")) == null? 8 : +tmp - 1), ((tmp = schedule.getAttribute("day")) == null? 3 : +tmp));
	zeroWeekN = +schedule.getAttribute("zeroWeekN");
	textWeek = document.getElementById("weekN");
	
	tds = sched_table.querySelectorAll("td:not([class])");
	thDay = sched_table.querySelectorAll(".r90:not(.tm)");
	spDt = sched_table.querySelectorAll(".dt");
	cWDate = new Date();

	lessons = schedule.getElementsByTagName("lesson");
	for(var i = 0; i < lessons.length; ++i)
	{
		if(lessons[i].hasAttribute("exp"))
			lessons[i].setAttribute("exp", lessons[i].getAttribute("exp").replace(/[^()+\-!~*\/%<>=&^|A-Za-z0-9_]+/g, "").replace(/[A-Za-z_]\w*/g, "weekC"));
		else
			lessons[i].setAttribute("weeks", "[" + lessons[i].getAttribute("weeks").replace(/^\D+/, "").replace(/\D+$/, "").replace(/\D+/g, ",") + "]");
	}
	dayI = new Array(thDay.length);
	var days = schedule.getElementsByTagName("day");
	for(var i = 0; i < dayI.length; ++i)
		dayI[i] = +days[i].getAttribute("num");
}

function changeWeek()
{
	textWeek.innerHTML = "Неделя " + week;
	
	clearDraw(thDay);
	clearDraw(tds);
	
	drawWeek(week);
}

function currWeek()
{
	cWDate.setTime(Date.now());
	week = Math.floor((Date.now() - startDate.valueOf()) / (3600000 * 24 * 7)) + 1 + zeroWeekN;
	currW = (weekC = week);
	changeWeek();
	drawDay();
	wrtDate();
}

function nextWeek()
{
	currW = Math.floor((Date.now() - startDate.valueOf()) / (3600000 * 24 * 7)) + 1 + zeroWeekN;
	weekC = ++week;
	changeWeek();
	if(week == currW)
	{
		cWDate.setTime(Date.now());
		drawDay();
	}
	else
		cWDate.setDate(cWDate.getDate() + 7);
	wrtDate();
}

function prevWeek()
{
	if(week - zeroWeekN > 1)
	{
		currW = Math.floor((Date.now() - startDate.valueOf()) / (3600000 * 24 * 7)) + 1 + zeroWeekN;
		weekC = --week;
		changeWeek();
		if(week == currW)
		{
			cWDate.setTime(Date.now());
			drawDay();
		}
		else
			cWDate.setDate(cWDate.getDate() - 7);
		wrtDate();
	}
}

function wrtDate()
{
	var tmp, tmp1, val = cWDate.valueOf();
	for(var i = 0; i < dayI.length; ++i)
	{
		tmp = cWDate.getDay();
		if(tmp == 0)
			tmp = 7;
		tmp1 = (dayI[i] == 0)? 7 : dayI[i];
		cWDate.setDate(cWDate.getDate() + tmp1 - tmp);
		
		tmp1 = "";
		if((tmp = cWDate.getDate()) < 10)
			tmp1 = "0";
		tmp1 += tmp + ".";
		
		if((tmp = cWDate.getMonth() + 1) < 10)
			tmp1 += "0";
		tmp1 += tmp + ".";
		
		if((tmp = cWDate.getFullYear() % 100) < 10)
			tmp1 += "0";
		tmp1 += tmp;
		
		spDt[i].innerHTML = tmp1;
	}
	cWDate.setTime(val);
}

function drawDay()
{
	if(dayI.indexOf(cWDate.getDay()) != -1)
		thDay[dayI.indexOf(cWDate.getDay())].setAttribute("bgcolor", selCd);
}

function clearDraw(tdArr)
{
	var tmp;
	
	for(var i = 0; i < tdArr.length; ++i)
		if((tmp = tdArr[i]).hasAttribute("bgcolor"))
			tmp.removeAttribute("bgcolor");
}

function drawWeek(week)
{
	var rowsubj = 0, rowclass = 0;
	var subj = 0, clss = 0;
	
	var maxRowCls = 0;
	
	var i = 0, lessP = 0;
	
	while(i < tds.length)
	{
		subj = i++;
		rowsubj = +tds[subj].getAttribute("rowspan");
		if(rowsubj == 0)
			rowsubj++;
		
		while(rowsubj > 0)
		{
			clss = i + 2;
			rowclass = +tds[clss].getAttribute("rowspan");
			if(rowclass == 0)
				rowclass++;
				
			maxRowCls = rowclass;
				
			while(rowclass > 0)
			{
				++i;
				
				if(testWeek(lessP))
					drawSubj(subj, clss, i);
					
				++lessP;
				++i;
				rowclass--;
				rowsubj--;
				
				if(maxRowCls - rowclass <= 1)
					++i;
			}
		}
	}
}

function drawSubj(subj, clss, weeks)
{
	tds[subj].setAttribute("bgcolor", selC);
	tds[clss].setAttribute("bgcolor", selC);
	tds[weeks - 1].setAttribute("bgcolor", selC);
	tds[weeks].setAttribute("bgcolor", selC);
}

function testWeek(lessP)
{
	if(lessons[lessP].hasAttribute("exp"))
		return eval(lessons[lessP].getAttribute("exp"));
	else
		return eval(lessons[lessP].getAttribute("weeks")).indexOf(week) != -1;
}

function create_control()
{
	var control_data = '<table id="control" align="center" cellpadding="10" cellspacing="0" border="0">' +
	'<tr><th><button onclick="prevWeek()"><h3>Предыдущая</h3></button></th><th><button onclick="currWeek()">' +
	'<h3>Текущая неделя</h3></button></th><th><button onclick="nextWeek()"><h3>Следующая</h3></button></th></tr>' +
	'<tr><td colspan="3"><a href="' + window.location.hash + '" onclick="printVer()">Версия для печати</a></td></tr></table>';
	
	document.body.innerHTML += control_data;
}

function printVer()
{
	clearDraw(thDay);
	clearDraw(tds);
	
	document.title = "Расписание. Версия для печати";
	textWeek.style.display = "none";
	document.getElementById("control").style.display = "none";
	
	for(var i = 0; i < spDt.length; ++i)
		spDt[i].style.display = "none";
	
	for(var i = 0; i < thDay.length; ++i)
		thDay[i].style.minWidth = "1.2em";
		
	return false;
}
