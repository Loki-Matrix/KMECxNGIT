async function fetchAttendance() {
    const rollno = document.getElementById('rollno').value;
    if (rollno.length !== 10) {
        showError("Please enter a valid 10-digit Mobile number.");
        return;
    }

    const resultDiv = document.getElementById('attendance-result');
    resultDiv.innerHTML = `<p>Processing data... Just a moment!</p>`;

    document.getElementById('loading').style.display = 'flex';

    try {
        const attendanceResponse = await fetch(`https://donalduck969.89determined.workers.dev/?mobile_number=${rollno}`);
        if (!attendanceResponse.ok) throw new Error('Incorrect number, Enter your parents number');

        const attendanceData = await attendanceResponse.json();
        if (!attendanceData || typeof attendanceData !== 'object') {
            throw new Error('Invalid data received, please check the mobile number.');
        }

        const nameResponse = await fetch(`https://nam969.89determined.workers.dev/?mobile_number=${rollno}`);
        if (!nameResponse.ok) throw new Error('Incorrect number, Enter your parents number');

        const studentName = await nameResponse.text();
        document.querySelector('.home-ui').style.display = 'none';
        displayAttendance(attendanceData, studentName.trim());
    } catch (error) {
        showError(error.message);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

function showError(message) {
    const errorPopup = document.getElementById('error-popup');
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
    errorPopup.style.display = 'block';

    document.getElementById('close-popup').addEventListener('click', () => {
        errorPopup.style.display = 'none';
    });
}

function displayAttendance(data, studentName) {
    const resultDiv = document.getElementById('attendance-result');
    resultDiv.innerHTML = '';

    const greeting = getGreeting();
    const studentNameHTML = `
    <div class="total-percentage">
        <span>${greeting}</span><br>
        <span class="student-name">${studentName}</span>
    </div>`;

    const totalPercentage = data.overallattperformance.totalpercentage;
    const totalPercentageHTML = `<div class="total-percentage">Overall Attendance: ${totalPercentage}%</div>`;

    let dayHTML = `<div class="box">
        <div class="box-header">Day-wise Attendance:</div>
        <table class="attendance-table">
            <thead>
                <tr><th>Date</th><th>Sessions</th></tr>
            </thead>
            <tbody>`;

    data.attandance.dayobjects.forEach(day => {
        let sessionHTML = '';
        Object.keys(day.sessions).forEach(session => {
            const status = getSessionStatus(day.sessions[session]);
            sessionHTML += `<td class="circle ${status}">${getSessionIcon(day.sessions[session])}</td>`;
        });
        dayHTML += `<tr><td>${day.date}</td>${sessionHTML}</tr>`;
    });

    dayHTML += `</tbody></table></div>`;

    let subjectHTML = `<div class="box">
        <div class="box-header">Subject-wise Attendance:</div>
        <table class="subject-table">
            <thead>
                <tr><th>Subject</th><th>Attendance</th></tr>
            </thead>
            <tbody>`;

    data.overallattperformance.overall.forEach(subject => {
        let percentage = subject.percentage !== '--' ? parseFloat(subject.percentage) : 0;
        let practical = subject.practical !== '--' ? parseFloat(subject.practical) : 0;

        const totalAttendance = Math.min(percentage + practical, 100);
        subjectHTML += `<tr>
            <td>${subject.subjectname}</td>
            <td>${totalAttendance}%</td>
        </tr>`;
    });

    subjectHTML += `</tbody></table></div>`;

    resultDiv.innerHTML = studentNameHTML + totalPercentageHTML + dayHTML + subjectHTML;
    resultDiv.style.display = 'block';
}

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning 🌞,";
    if (hour < 18) return "Good Afternoon 🌞,️";
    return "Good Evening 🌃,";
}

function getSessionStatus(sessionValue) {
    if (sessionValue === "1") return 'present';
    if (sessionValue === "0") return 'absent';
    return 'nosessions';
}

function getSessionIcon(sessionValue) {
    if (sessionValue === "1") return '✔';
    if (sessionValue === "0") return '✘';
    return '○';
}

function checkRollno() {
    const rollno = document.getElementById('rollno').value;
    if (rollno.length === 10) {
        fetchAttendance();
    }
}

document.getElementById('rollno').addEventListener('input', checkRollno);
