/* ============================================
   VIGILANT NEON — Shared Navigation Component
   ============================================ */

const API_BASE = "api";
/**
 * Builds the sidebar and topbar for every page.
 * Call buildNavigation('pageName') where pageName matches a key in NAV_ITEMS.
 */

const NAV_ITEMS = [
    { key: 'dashboard',     label: 'Dashboard',     icon: 'dashboard',     href: 'index.html' },
    { key: 'add-patient',   label: 'Add Patient',   icon: 'person_add',    href: 'add-patient.html' },
    { key: 'patient-list',  label: 'Patient List',  icon: 'group',         href: 'patient-list.html' },
    { key: 'ai-analysis',   label: 'AI Analysis',   icon: 'psychology',    href: 'ai-analysis.html' },
    { key: 'resources',     label: 'Resources',     icon: 'account_tree',  href: 'resources.html' },
    { key: 'bias-checker',  label: 'Bias Checker',  icon: 'balance',       href: 'bias-checker.html' },
    { key: 'reports',       label: 'Reports',        icon: 'assessment',   href: 'reports.html' },
    { key: 'admin', label: 'Admin Panel', icon: 'admin_panel_settings', href: 'admin-dashboard.html' }

];

const FOOTER_ITEMS = [
    { label: 'Settings', icon: 'settings', href: '#' },
    { label: 'Support',  icon: 'help',     href: '#' },
];

function buildSidebar(activePage) {
    const sidebar = document.createElement('aside');
    sidebar.className = 'sidebar';
    sidebar.id = 'main-sidebar';

    // Header
    sidebar.innerHTML = `
        <div class="sidebar-header">
            <div class="sidebar-brand">
                <div class="sidebar-brand-icon">
                    <span class="material-symbols-outlined">health_and_safety</span>
                </div>
                <div>
                    <div class="sidebar-brand-title">COMMAND CENTER</div>
                    <div class="sidebar-brand-subtitle">Precision Resource Mgmt</div>
                </div>
            </div>
        </div>
        <button class="sidebar-emergency" onclick="alert('Emergency Override Activated!')">
            ⚠ EMERGENCY OVERRIDE
        </button>
        <nav class="sidebar-nav" id="sidebar-nav"></nav>
        <div class="sidebar-footer" id="sidebar-footer"></div>
    `;

    // Navigation links
    const nav = sidebar.querySelector('#sidebar-nav');

NAV_ITEMS.forEach(item => {
    const a = document.createElement('a');
    a.href = item.href;
    a.className = 'nav-link' + (item.key === activePage ? ' active' : '');
    a.id = 'nav-' + item.key;
    a.innerHTML = `
        <span class="material-symbols-outlined">${item.icon}</span>
        <span>${item.label}</span>
    `;

    // ✅ Force real page navigation
    a.addEventListener("click", function(e) {
        e.preventDefault();
        window.location.href = item.href;
    });

    nav.appendChild(a);
});

    

    // Footer links
    const footer = sidebar.querySelector('#sidebar-footer');
    FOOTER_ITEMS.forEach(item => {
        const a = document.createElement('a');
        a.href = item.href;
        a.className = 'nav-link';
        a.innerHTML = `
            <span class="material-symbols-outlined">${item.icon}</span>
            <span>${item.label}</span>
        `;
        footer.appendChild(a);
    });

    return sidebar;
}

function buildTopbar() {
    const header = document.createElement('header');
    header.className = 'topbar';
    header.id = 'main-topbar';

    header.innerHTML = `
        <div class="topbar-brand">VIGILANT NEON</div>
        <div class="topbar-actions">
            <div class="topbar-search">
                <span class="material-symbols-outlined">search</span>
                <input type="text" placeholder="Search systems..." />
            </div>
            <button class="icon-btn" title="Notifications">
                <span class="material-symbols-outlined">notifications</span>
                <span class="notification-dot"></span>
            </button>
            <button class="icon-btn" title="Emergency">
                <span class="material-symbols-outlined">emergency_home</span>
            </button>
            <button class="icon-btn" title="Account" id="accountBtn">
                <span class="material-symbols-outlined">account_circle</span>
            </button>
        </div>
    `;

    return header;
}

function buildNavigation(activePage) {
    // Add background grid
    const grid = document.createElement('div');
    grid.className = 'cyber-grid';
    document.body.prepend(grid);

    // Insert sidebar
    document.body.prepend(buildSidebar(activePage));

    // Insert topbar into main-content
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.prepend(buildTopbar());
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.buildNavigation = buildNavigation;
}

// ================= UTILITY FUNCTIONS =================

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    }[char]));
}

function formatAiExplanationHtml(text) {
    const normalized = String(text ?? '').replace(/\r\n?/g, '\n').trim();
    if (!normalized) {
        return '<span style="color:var(--on-surface-variant);">No AI explanation available.</span>';
    }

    const highlighted = escapeHtml(normalized)
        .replace(/^(Reasoning:)/im, '<strong style="color:var(--primary-container);">$1</strong>')
        .replace(/^(Risk Level:)/im, '<strong style="color:var(--secondary);">$1</strong>')
        .replace(/^(Conclusion:)/im, '<strong style="color:var(--tertiary-container);">$1</strong>');

    return highlighted
        .replace(/\n{2,}/g, '<br><br>')
        .replace(/\n/g, '<br>');
}

if (typeof window !== 'undefined') {
    window.formatAiExplanationHtml = formatAiExplanationHtml;
}

async function analyzePatient(patientData) {
    try {
        console.log('AI request payload:', patientData);

        const res = await fetch(`${API_BASE}/analyze_patient.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(patientData),
        });

        if (!res.ok) {
            throw new Error(`Server error (${res.status})`);
        }

        const data = await res.json();
        console.log('AI Response:', data);

        if (!data || typeof data !== 'object' || typeof data.explanation !== 'string') {
            throw new Error('Invalid AI response payload');
        }

        return data;
    } catch (err) {
        console.error('analyzePatient failed:', err);
        return null;
    }
}

if (typeof window !== 'undefined') {
    window.analyzePatient = analyzePatient;
}

let latestCreatedPatient = null;

function notifyAllocationUpdate() {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        window.localStorage.setItem('smartHospitalAllocationsUpdatedAt', String(Date.now()));
    }
}

async function loadAssignableResources(selectedResource = '') {
    const select = document.getElementById('manual-resource-select');
    if (!select) {
        return [];
    }

    select.innerHTML = '<option value="">Loading resources...</option>';
    select.disabled = true;

    const data = await apiFetch('get_resources.php');
    const resources = Array.isArray(data?.resources)
        ? data.resources
            .filter((resource) => resource.status === 'available' || resource.resource_code === selectedResource)
            .sort((a, b) => a.resource_code.localeCompare(b.resource_code))
        : [];

    if (resources.length === 0) {
        select.innerHTML = '<option value="">No resources available</option>';
        return [];
    }

    select.innerHTML = `
        <option value="">Choose a resource</option>
        ${resources.map((resource) => `
            <option value="${resource.resource_code}">
                ${resource.resource_code} - ${resource.name} (${resource.ward})
            </option>
        `).join('')}
    `;

    if (selectedResource) {
        select.value = selectedResource;
    }

    select.disabled = false;
    return resources;
}

function updateManualAssignmentBadge(resourceCode) {
    const badge = document.getElementById('assignment-status-badge');
    if (!badge) {
        return;
    }

    badge.className = 'status-pill';
    if (resourceCode) {
        badge.classList.add('stable');
        badge.textContent = 'Assigned';
    } else {
        badge.classList.add('moderate');
        badge.textContent = 'Not Assigned';
    }
}

async function showManualAssignmentPanel(patient) {
    const panel = document.getElementById('manual-assignment-panel');
    const label = document.getElementById('assignment-patient-label');
    const helper = document.getElementById('assignment-helper-text');
    const assignBtn = document.getElementById('btn-assign-resource');
    const select = document.getElementById('manual-resource-select');

    if (!panel || !label || !helper || !assignBtn || !select) {
        return;
    }

    latestCreatedPatient = patient;
    panel.style.display = 'block';
    label.textContent = `${patient.name} (${patient.patient_code})`;
    helper.textContent = patient.recommended_resource
        ? `Recommended resource: ${patient.recommended_resource}. Choose a live resource to finalize the assignment.`
        : 'Choose a live resource to finalize the assignment.';

    updateManualAssignmentBadge(patient.assigned_resource || '');
    await loadAssignableResources(patient.assigned_resource || '');
    assignBtn.disabled = !select.value;
}

async function assignSelectedResource() {
    const select = document.getElementById('manual-resource-select');
    const assignBtn = document.getElementById('btn-assign-resource');
    const helper = document.getElementById('assignment-helper-text');

    if (!latestCreatedPatient || !select || !assignBtn || !helper) {
        showToast('Add a patient before assigning a resource.', 'error');
        return;
    }

    if (!select.value) {
        showToast('Select a resource first.', 'error');
        return;
    }

    const originalText = assignBtn.innerHTML;
    assignBtn.innerHTML = '<span class="material-symbols-outlined" style="animation: spin 1s linear infinite;">sync</span> Assigning...';
    assignBtn.disabled = true;
    select.disabled = true;

    const result = await apiFetch('assign_resource.php', {
        method: 'POST',
        body: JSON.stringify({
            patient_id: latestCreatedPatient.id,
            resource_name: select.value,
        }),
    });

    assignBtn.innerHTML = originalText;

    if (result && result.status === 'success') {
        latestCreatedPatient.assigned_resource = result.assigned_resource;
        updateManualAssignmentBadge(result.assigned_resource);
        helper.innerHTML = `Assigned <strong style="color:var(--primary-container);">${result.assigned_resource}</strong> to ${escapeHtml(latestCreatedPatient.name)}.`;
        await loadAssignableResources(result.assigned_resource);
        select.value = result.assigned_resource;
        assignBtn.disabled = false;
        showToast(result.message || 'Resource assigned successfully.', 'success');
        notifyAllocationUpdate();
    } else {
        helper.textContent = result?.message || 'Failed to assign resource.';
        assignBtn.disabled = false;
        await loadAssignableResources(latestCreatedPatient.assigned_resource || '');
        showToast(result?.message || 'Failed to assign resource.', 'error');
    }
}

if (typeof window !== 'undefined') {
    window.notifyAllocationUpdate = notifyAllocationUpdate;
}

/** Fetch wrapper with error handling */
async function apiFetch(endpoint, options = {}) {
    try {
        const url = `${API_BASE}/${endpoint}`;
        const res = await fetch(url, {
            credentials: "include",
            headers: { 'Content-Type': 'application/json' },
            ...options,
        });
        const raw = await res.text();

        let data = null;
        try {
            data = raw ? JSON.parse(raw) : null;
        } catch (parseErr) {
            console.error('Invalid JSON response from', url, parseErr, raw);
            return null;
        }

        if (!res.ok || data?.status === 'error') {
            console.error('API Error:', data?.message || `HTTP ${res.status}`, data);
            return data;
        }

        return data;
    } catch (err) {
        console.error('Network error:', err);
        return null;
    }
}

/** Format number with commas */
function formatNum(n) {
    return Number(n).toLocaleString();
}

/** Show a toast notification */
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <span class="material-symbols-outlined">${type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}</span>
        <span>${escapeHtml(message)}</span>
    `;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ================= PATIENT FORM SUBMIT =================

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("add-patient-form");
    const manualResourceSelect = document.getElementById('manual-resource-select');
    const assignResourceBtn = document.getElementById('btn-assign-resource');

    if (manualResourceSelect && assignResourceBtn) {
        manualResourceSelect.addEventListener('change', function () {
            assignResourceBtn.disabled = !manualResourceSelect.value;
        });

        assignResourceBtn.addEventListener('click', assignSelectedResource);
    }

    if (form) {
        form.addEventListener("submit", async function (e) {
            e.preventDefault();

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="material-symbols-outlined" style="animation: spin 1s linear infinite;">sync</span> Processing...';
            submitBtn.disabled = true;

            const data = {
                name: document.getElementById("patient_name").value,
                age: document.getElementById("patient_age").value,
                gender: document.getElementById("patient_gender").value,
                symptoms: document.getElementById("patient_symptoms").value,
                oxygen_level: document.getElementById("patient_spo2").value
            };

            const result = await apiFetch('add_patient.php', {
                method: 'POST',
                body: JSON.stringify(data),
            });

            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;

            if (result && result.status === 'success') {
                const createdPatient = {
                    id: result.patient_id,
                    patient_code: result.patient_code,
                    name: data.name,
                    recommended_resource: result.ai_analysis?.recommended_resource || result.ai_analysis?.resource_type || '',
                    assigned_resource: '',
                };

                showToast(`Patient "${data.name}" added! Code: ${result.patient_code}`, 'success');
                showToast(`AI Severity: ${result.ai_analysis.severity_score}/10 (${result.ai_analysis.severity})`, 'info');
                form.reset();

                // Show AI analysis panel
                showAiResultPanel(result.ai_analysis, data.name);
                showManualAssignmentPanel(createdPatient);
            } else {
                showToast(result?.message || 'Failed to add patient', 'error');
            }
        });

        const btnAnalyzeAi = document.getElementById("btn-analyze-ai");
        if (btnAnalyzeAi) {
            btnAnalyzeAi.addEventListener("click", async function () {
                const data = {
                    name: document.getElementById("patient_name").value || "Unknown Patient",
                    age: document.getElementById("patient_age").value,
                    gender: document.getElementById("patient_gender").value,
                    symptoms: document.getElementById("patient_symptoms").value,
                    oxygen_level: document.getElementById("patient_spo2").value
                };

                const originalText = btnAnalyzeAi.innerHTML;
                btnAnalyzeAi.innerHTML = '<span class="material-symbols-outlined" style="animation: spin 1s linear infinite;">sync</span> Querying Gemini...';
                btnAnalyzeAi.disabled = true;

                const result = await analyzePatient(data);

                btnAnalyzeAi.innerHTML = originalText;
                btnAnalyzeAi.disabled = false;

                if (result && result.status === 'success') {
                    showToast(`Gemini AI Analysis complete`, 'info');
                    showAiResultPanel(result, data.name + ' (Preview)');
                } else {
                    showToast(result?.message || 'Failed to connect to AI', 'error');
                }
            });
        }
    }
});

/** Show AI result panel after patient add */
function showAiResultPanel(ai, patientName) {
    // Remove existing panel
    const existing = document.getElementById('ai-result-panel');
    if (existing) existing.remove();

    const safePatientName = escapeHtml(patientName || 'Unknown Patient');
    const structuredExplanation = typeof ai?.explanation === 'string' ? ai.explanation.trim() : '';
    const rationaleMarkers = Array.isArray(ai?.rationale?.markers) ? ai.rationale.markers : [];
    const hasMetrics = ai?.severity !== undefined || ai?.severity_score !== undefined || ai?.confidence !== undefined || ai?.recommended_resource !== undefined;

    const panel = document.createElement('div');
    panel.id = 'ai-result-panel';
    panel.className = 'glass-panel rounded-xl p-md animate-fade-in';
    panel.style.cssText = 'margin-top: 24px; border-color: rgba(0,242,255,0.3);';

    if (structuredExplanation && rationaleMarkers.length === 0 && !hasMetrics) {
        panel.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <h3 class="h3 flex items-center gap-sm">
                    <span class="material-symbols-outlined" style="color:var(--primary-container);">psychology</span>
                    AI Explanation: ${safePatientName}
                </h3>
                <button onclick="this.closest('#ai-result-panel').remove()" class="icon-btn" title="Close">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <div style="padding:20px;background:rgba(19,19,21,0.5);border-radius:var(--radius-md);border:1px solid rgba(255,255,255,0.05);color:var(--on-surface-variant);line-height:1.8;white-space:normal;overflow-wrap:anywhere;word-break:break-word;">
                ${formatAiExplanationHtml(structuredExplanation)}
            </div>
        `;

        const formCard = document.querySelector('.form-card');
        if (formCard) formCard.parentNode.insertBefore(panel, formCard.nextSibling);
        return;
    }

    let rationaleHTML = '';
    if (rationaleMarkers.length > 0) {
        rationaleMarkers.forEach(m => {
            rationaleHTML += `
                <div class="rationale-item" style="display:flex;gap:12px;align-items:flex-start;margin-bottom:16px;">
                    <div style="width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;
                        background:rgba(${m.color==='pink'?'255,36,228':m.color==='cyan'?'0,242,255':'234,210,255'},0.1);
                        border:1px solid rgba(${m.color==='pink'?'255,36,228':m.color==='cyan'?'0,242,255':'234,210,255'},0.3);flex-shrink:0;">
                        <span class="material-symbols-outlined" style="font-size:14px;color:var(--${m.color==='pink'?'secondary-container':m.color==='cyan'?'primary-container':'tertiary-container'});">${escapeHtml(m.icon)}</span>
                    </div>
                    <div>
                        <div style="font-weight:600;color:var(--on-surface);font-size:14px;">${escapeHtml(m.title)}</div>
                        <div style="font-size:13px;color:var(--on-surface-variant);margin-top:4px;">${escapeHtml(m.detail)}</div>
                    </div>
                </div>`;
        });
    }

    if (structuredExplanation) {
        rationaleHTML += `
            <div style="padding:20px;background:rgba(19,19,21,0.5);border-radius:var(--radius-md);border:1px solid rgba(255,255,255,0.05);color:var(--on-surface-variant);line-height:1.8;white-space:normal;overflow-wrap:anywhere;word-break:break-word;">
                ${formatAiExplanationHtml(structuredExplanation)}
            </div>
        `;
    }

    const severity = ai.severity || 'stable';
    const severityClass = severity === 'critical' ? 'critical' : severity === 'moderate' ? 'moderate' : 'stable';
    const severityScore = ai.severity_score ?? '--';
    const confidence = ai.confidence ?? '--';
    const recommendedResource = escapeHtml(ai.recommended_resource || 'Pending allocation');

    panel.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <h3 class="h3 flex items-center gap-sm">
                <span class="material-symbols-outlined" style="color:var(--primary-container);">psychology</span>
                AI Analysis: ${safePatientName}
            </h3>
            <button onclick="this.closest('#ai-result-panel').remove()" class="icon-btn" title="Close">
                <span class="material-symbols-outlined">close</span>
            </button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:20px;">
            <div style="text-align:center;padding:16px;background:rgba(19,19,21,0.5);border-radius:var(--radius-md);border:1px solid rgba(255,255,255,0.05);">
                <div class="label-caps text-muted" style="margin-bottom:8px;">Severity Score</div>
                <div class="h2" style="color:${severity==='critical'?'var(--error)':severity==='moderate'?'var(--secondary)':'var(--primary-container)'};">${severityScore}</div>
                <span class="status-pill ${severityClass}" style="margin-top:8px;font-size:11px;">${escapeHtml(String(severityClass).toUpperCase())}</span>
            </div>
            <div style="text-align:center;padding:16px;background:rgba(19,19,21,0.5);border-radius:var(--radius-md);border:1px solid rgba(255,255,255,0.05);">
                <div class="label-caps text-muted" style="margin-bottom:8px;">Confidence</div>
                <div class="h2 text-cyan">${confidence}${confidence === '--' ? '' : '%'}</div>
            </div>
            <div style="text-align:center;padding:16px;background:rgba(19,19,21,0.5);border-radius:var(--radius-md);border:1px solid rgba(255,255,255,0.05);">
                <div class="label-caps text-muted" style="margin-bottom:8px;">Recommended</div>
                <div class="h3 text-pink" style="font-size:16px;">${recommendedResource}</div>
            </div>
        </div>
        <h4 class="h3" style="margin-bottom:16px;font-size:16px;">
            <span class="material-symbols-outlined" style="color:var(--tertiary-container);font-size:18px;">troubleshoot</span>
            Why This Resource?
        </h4>
        ${rationaleHTML}
    `;

    const formCard = document.querySelector('.form-card');
    if (formCard) formCard.parentNode.insertBefore(panel, formCard.nextSibling);
}

document.addEventListener("DOMContentLoaded", function () {
    const accountBtn = document.getElementById("accountBtn");

    if (accountBtn) {
        accountBtn.addEventListener("click", function () {
            
        });
    }
});

document.addEventListener("DOMContentLoaded", async function () {

    try {
        const res = await fetch("api/me.php", {
            credentials: "include"
        });

        const data = await res.json();

        if (!data.logged_in) {
            const adminLink = document.getElementById("nav-admin");
            if (adminLink) {
                adminLink.remove(); // remove completely
            }
        }

    } catch (err) {
        console.error("Auth check failed", err);
    }

});

document.addEventListener("DOMContentLoaded", function () {

    const accountBtn = document.querySelector('button[title="Account"]');

    if (!accountBtn) return;

    accountBtn.addEventListener("click", async function () {

        const res = await fetch("api/me.php", {
            credentials: "include"
        });

        const data = await res.json();

        if (!data.logged_in) {
            // Not logged in → go to login page
            window.location.href = "login.html";
        } else {
            // Logged in → show logout dropdown
            showLogoutMenu(accountBtn);
        }

    });

});

function showLogoutMenu(button) {

    // Remove existing menu if already open
    const existing = document.getElementById("logoutDropdown");
    if (existing) {
        existing.remove();
        return;
    }

    const menu = document.createElement("div");
    menu.id = "logoutDropdown";
    menu.style.position = "absolute";
    menu.style.top = "60px";
    menu.style.right = "20px";
    menu.style.background = "#111827";
    menu.style.padding = "10px 15px";
    menu.style.borderRadius = "8px";
    menu.style.boxShadow = "0 0 15px rgba(0,255,255,0.3)";
    menu.style.cursor = "pointer";
    menu.style.zIndex = "9999";
    menu.innerText = "Logout";

    menu.addEventListener("click", async function () {
        await fetch("api/logout.php", {
            credentials: "include"
        });

        menu.remove();
        window.location.href = "login.html";
    });

    document.body.appendChild(menu);
}