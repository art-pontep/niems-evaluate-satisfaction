// ===== Application State =====
const APP_STATE = {
    currentPage: 'landing',
    adminPassword: 'admin123', // Default password
    departments: [
        'สำนักบริหารกลาง',
        'สำนักยุทธศาสตร์',
        'วิทยาลัยวิชาการเตรียมความพร้อมด้านการแพทย์ฉุกเฉิน',
        'สำนักบริหารจัดการระบบการแพทย์ฉุกเฉินพื้นที่ 1',
        'สำนักบริหารจัดการระบบการแพทย์ฉุกเฉินพื้นที่ 2',
        'สำนักบริหารจัดการระบบการแพทย์ฉุกเฉินพื้นที่ 3',
        'สำนักบริหารจัดการระบบการแพทย์ฉุกเฉินพื้นที่ 4',
        'สำนักบริหารจัดการระบบการแพทย์ฉุกเฉินกลาง',
        'สำนักกฎหมายการแพทย์ฉุกเฉิน',
        'สำนักดิจิทัลการแพทย์ฉุกเฉิน',
        'กลุ่มสื่อสารการแพทย์ฉุกเฉิน',
        'กลุ่มพัฒนาคุณภาพองค์การ',
        'กลุ่มบริหารกองทุนการแพทย์ฉุกเฉิน',
        'กลุ่มตรวจสอบภายใน'
    ],
    services: [
        'บริการด้านการให้ข้อมูลระบบ NDEMS',
        'บริการด้านสนับสนุน IPAD',
        'บริการดูแลแก้ไขปัญหาด้านไอทีองค์กร',
        'บริการสนับสนุนวิทยุคมนาคม',
        'บริการให้คำปรึกษาด้านระบบดิจิทัล'
    ],
    responses: []
};

// ===== Choices.js Instances =====
let departmentChoices = null;
let serviceChoices = null;

// ===== Local Storage Management =====
function saveToLocalStorage() {
    localStorage.setItem('niems_satisfaction_data', JSON.stringify(APP_STATE));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('niems_satisfaction_data');
    if (saved) {
        const data = JSON.parse(saved);
        APP_STATE.departments = data.departments || APP_STATE.departments;
        APP_STATE.services = data.services || APP_STATE.services;
        APP_STATE.responses = data.responses || [];
        APP_STATE.adminPassword = data.adminPassword || APP_STATE.adminPassword;
    }
}

// ===== Page Navigation =====
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    APP_STATE.currentPage = pageId;
}

function showLanding() {
    showPage('landing-page');
}

function showUserForm() {
    showPage('user-form-page');
    populateDropdowns();
}

function showAdminLogin() {
    showPage('admin-login-page');
    document.getElementById('admin-login-form').reset();
    document.getElementById('login-error').style.display = 'none';
}

function showAdminDashboard() {
    showPage('admin-dashboard-page');
    updateDashboard();
}

function logout() {
    localStorage.removeItem('niems_admin_remembered');
    showLanding();
}

// ===== Tab Navigation =====
function showTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    event.target.closest('.tab-button').classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName + '-tab').classList.add('active');
}

// ===== Populate Dropdowns =====
function populateDropdowns() {
    const departmentSelect = document.getElementById('department');
    const serviceSelect = document.getElementById('serviceType');

    // Destroy existing Choices instances if they exist
    if (departmentChoices) {
        departmentChoices.destroy();
        departmentChoices = null;
    }
    if (serviceChoices) {
        serviceChoices.destroy();
        serviceChoices = null;
    }

    // Clear existing options (except the first placeholder)
    departmentSelect.innerHTML = '<option value="">-- เลือกสังกัด --</option>';
    serviceSelect.innerHTML = '<option value="">-- เลือกประเภทบริการ --</option>';

    // Populate departments
    APP_STATE.departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept;
        option.textContent = dept;
        departmentSelect.appendChild(option);
    });

    // Populate services
    APP_STATE.services.forEach(service => {
        const option = document.createElement('option');
        option.value = service;
        option.textContent = service;
        serviceSelect.appendChild(option);
    });

    // Initialize Choices.js for searchable dropdowns
    const choicesConfig = {
        searchEnabled: true,
        searchPlaceholderValue: 'พิมพ์เพื่อค้นหา...',
        noResultsText: 'ไม่พบผลลัพธ์',
        noChoicesText: 'ไม่มีตัวเลือก',
        itemSelectText: '',
        placeholderValue: null,
        searchResultLimit: 10,
        shouldSort: false,
        position: 'bottom',
        resetScrollPosition: true,
        searchFloor: 1,
        fuseOptions: {
            threshold: 0.3,
        },
    };

    departmentChoices = new Choices(departmentSelect, {
        ...choicesConfig,
        placeholderValue: '-- เลือกสังกัด --',
    });

    serviceChoices = new Choices(serviceSelect, {
        ...choicesConfig,
        placeholderValue: '-- เลือกประเภทบริการ --',
    });
}

// ===== Form Submission =====
document.getElementById('evaluation-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = {
        timestamp: new Date().toISOString(),
        department: document.getElementById('department').value,
        serviceType: document.getElementById('serviceType').value,
        satisfaction: document.querySelector('input[name="satisfaction"]:checked').value,
        comments: document.getElementById('comments').value.trim()
    };

    // Save response
    APP_STATE.responses.push(formData);
    saveToLocalStorage();

    // Show success modal
    showSuccessModal();

    // Reset form and Choices.js
    this.reset();
    if (departmentChoices) departmentChoices.setChoiceByValue('');
    if (serviceChoices) serviceChoices.setChoiceByValue('');
});

// ===== Success Modal =====
function showSuccessModal() {
    const modal = document.getElementById('success-modal');
    modal.classList.add('active');
}

function closeSuccessModal() {
    const modal = document.getElementById('success-modal');
    modal.classList.remove('active');
    showLanding();
}

// ===== Admin Login =====
document.getElementById('admin-login-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const password = document.getElementById('adminPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    const errorDiv = document.getElementById('login-error');

    if (password === APP_STATE.adminPassword) {
        if (rememberMe) {
            localStorage.setItem('niems_admin_remembered', 'true');
        }
        showAdminDashboard();
    } else {
        errorDiv.style.display = 'block';
        document.getElementById('adminPassword').value = '';
    }
});

// ===== Dashboard Updates =====
let satisfactionChart = null;
let serviceChart = null;

function updateDashboard() {
    updateStatistics();
    updateCharts();
    updateConfigLists();
    updateDataTable();
}

function updateStatistics() {
    const totalResponses = APP_STATE.responses.length;
    document.getElementById('total-responses').textContent = totalResponses;

    // Find most popular service
    if (totalResponses > 0) {
        const serviceCounts = {};
        APP_STATE.responses.forEach(response => {
            serviceCounts[response.serviceType] = (serviceCounts[response.serviceType] || 0) + 1;
        });

        const popularService = Object.keys(serviceCounts).reduce((a, b) =>
            serviceCounts[a] > serviceCounts[b] ? a : b
        );

        // Show full service name
        document.getElementById('popular-service').textContent = popularService;
    } else {
        document.getElementById('popular-service').textContent = '-';
    }
}

function updateCharts() {
    // Satisfaction Distribution Chart
    const satisfactionCounts = {
        'ควรปรับปรุง': 0,
        'พอใช้': 0,
        'ดีมาก': 0
    };

    APP_STATE.responses.forEach(response => {
        satisfactionCounts[response.satisfaction]++;
    });

    const ctx1 = document.getElementById('satisfaction-chart').getContext('2d');

    if (satisfactionChart) {
        satisfactionChart.destroy();
    }

    satisfactionChart = new Chart(ctx1, {
        type: 'doughnut',
        data: {
            labels: ['ควรปรับปรุง', 'พอใช้', 'ดีมาก'],
            datasets: [{
                data: [
                    satisfactionCounts['ควรปรับปรุง'],
                    satisfactionCounts['พอใช้'],
                    satisfactionCounts['ดีมาก']
                ],
                backgroundColor: [
                    '#f97316',
                    '#fbbf24',
                    '#10b981'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 14,
                            family: 'Sarabun'
                        }
                    }
                }
            }
        }
    });

    // Service Statistics Chart
    const serviceCounts = {};
    APP_STATE.services.forEach(service => {
        serviceCounts[service] = 0;
    });

    APP_STATE.responses.forEach(response => {
        if (serviceCounts.hasOwnProperty(response.serviceType)) {
            serviceCounts[response.serviceType]++;
        }
    });

    const ctx2 = document.getElementById('service-chart').getContext('2d');

    if (serviceChart) {
        serviceChart.destroy();
    }

    // Shorten service names for chart
    const shortServiceNames = APP_STATE.services.map(s => {
        return s.replace('บริการ', '').replace('ด้าน', '').substring(0, 25);
    });

    serviceChart = new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: shortServiceNames,
            datasets: [{
                label: 'จำนวนการประเมิน',
                data: APP_STATE.services.map(service => serviceCounts[service]),
                backgroundColor: 'rgba(0, 86, 179, 0.8)',
                borderColor: 'rgba(0, 123, 255, 1)',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            indexAxis: 'y', // Horizontal bars
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        font: {
                            family: 'Sarabun'
                        }
                    }
                },
                y: {
                    ticks: {
                        font: {
                            family: 'Sarabun',
                            size: 12
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function updateConfigLists() {
    // Update departments table
    const deptTableBody = document.getElementById('department-table-body');
    deptTableBody.innerHTML = '';

    APP_STATE.departments.forEach((dept, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${dept}</td>
            <td>
                <button class="config-delete-btn" onclick="deleteDepartment(${index})">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    ลบ
                </button>
            </td>
        `;
        deptTableBody.appendChild(row);
    });

    // Update services table
    const serviceTableBody = document.getElementById('service-table-body');
    serviceTableBody.innerHTML = '';

    APP_STATE.services.forEach((service, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${service}</td>
            <td>
                <button class="config-delete-btn" onclick="deleteService(${index})">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    ลบ
                </button>
            </td>
        `;
        serviceTableBody.appendChild(row);
    });
}

function updateDataTable() {
    const tbody = document.getElementById('data-table-body');
    tbody.innerHTML = '';

    if (APP_STATE.responses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-data">ยังไม่มีข้อมูลการประเมิน</td></tr>';
        return;
    }

    // Sort by timestamp (newest first)
    const sortedResponses = [...APP_STATE.responses].sort((a, b) =>
        new Date(b.timestamp) - new Date(a.timestamp)
    );

    sortedResponses.forEach(response => {
        const row = document.createElement('tr');
        const date = new Date(response.timestamp);
        const formattedDate = date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${response.department}</td>
            <td>${response.serviceType}</td>
            <td>
                <span class="satisfaction-badge" style="background: ${getSatisfactionColor(response.satisfaction)};">
                    ${response.satisfaction}
                </span>
            </td>
            <td>${response.comments || '-'}</td>
        `;
        tbody.appendChild(row);
    });
}

function getSatisfactionColor(satisfaction) {
    const colors = {
        'ควรปรับปรุง': '#f97316',
        'พอใช้': '#fbbf24',
        'ดีมาก': '#10b981'
    };
    return colors[satisfaction] || '#94a3b8';
}

// ===== Configuration Management =====
function addDepartment() {
    const input = document.getElementById('new-department');
    const value = input.value.trim();

    if (value && !APP_STATE.departments.includes(value)) {
        APP_STATE.departments.push(value);
        saveToLocalStorage();
        updateConfigLists();
        input.value = '';
    }
}

function deleteDepartment(index) {
    if (confirm('คุณต้องการลบสังกัดนี้หรือไม่?')) {
        APP_STATE.departments.splice(index, 1);
        saveToLocalStorage();
        updateConfigLists();
    }
}

function addService() {
    const input = document.getElementById('new-service');
    const value = input.value.trim();

    if (value && !APP_STATE.services.includes(value)) {
        APP_STATE.services.push(value);
        saveToLocalStorage();
        updateConfigLists();
        updateCharts();
        input.value = '';
    }
}

function deleteService(index) {
    if (confirm('คุณต้องการลบบริการนี้หรือไม่?')) {
        APP_STATE.services.splice(index, 1);
        saveToLocalStorage();
        updateConfigLists();
        updateCharts();
    }
}

// ===== Data Export =====
function exportData() {
    if (APP_STATE.responses.length === 0) {
        alert('ไม่มีข้อมูลให้ส่งออก');
        return;
    }

    // Create CSV content
    const headers = ['วันที่', 'สังกัด', 'ประเภทบริการ', 'ความพึงพอใจ', 'ข้อเสนอแนะ'];
    const rows = APP_STATE.responses.map(response => {
        const date = new Date(response.timestamp);
        const formattedDate = date.toLocaleDateString('th-TH') + ' ' + date.toLocaleTimeString('th-TH');

        return [
            formattedDate,
            response.department,
            response.serviceType,
            response.satisfaction,
            response.comments || ''
        ];
    });

    // Convert to CSV
    let csv = '\uFEFF'; // UTF-8 BOM for Excel
    csv += headers.join(',') + '\n';
    rows.forEach(row => {
        csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().split('T')[0];

    link.setAttribute('href', url);
    link.setAttribute('download', `niems_satisfaction_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ===== Keyboard Shortcuts =====
document.addEventListener('keydown', function (e) {
    // ESC to close modal
    if (e.key === 'Escape') {
        const modal = document.getElementById('success-modal');
        if (modal.classList.contains('active')) {
            closeSuccessModal();
        }
    }
});

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', function () {
    loadFromLocalStorage();
    
    // Check if admin is remembered
    if (localStorage.getItem('niems_admin_remembered') === 'true') {
        showAdminDashboard();
    } else {
        showLanding();
    }

    // Close modal when clicking outside
    document.getElementById('success-modal').addEventListener('click', function (e) {
        if (e.target === this) {
            closeSuccessModal();
        }
    });
});
