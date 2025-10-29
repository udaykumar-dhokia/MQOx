const API_BASE = "http://localhost:3000";
let selectedButton = null;

window.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  loadAllQueues();

  document.getElementById("refreshBtn").addEventListener("click", loadAllQueues);

});

// --------- Header Component ---------
function renderHeader() {
  const headerContainer = document.getElementById("header");
  headerContainer.innerHTML = `
    <div class="flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <img src="./assets/logo.jpeg" width="60" alt="MQOx Logo" />
        <h1 class="text-2xl font-bold">MQOx Dashboard</h1>
      </div>
      <div class="flex items-center gap-4">
        <a href="https://www.npmjs.com/package/@udthedeveloper/mqox" target="_blank">
          <img src="https://img.shields.io/npm/v/@udthedeveloper/mqox?color=blue&label=npm&logo=npm" alt="NPM version">
        </a>
        <a href="https://github.com/udaykumar-dhokia/mqox" target="_blank" class="flex items-center gap-1 text-gray-800 hover:text-black font-semibold">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.262.82-.583 0-.288-.012-1.243-.018-2.254-3.338.725-4.042-1.61-4.042-1.61-.546-1.387-1.334-1.756-1.334-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.304.762-1.604-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.468-2.382 1.235-3.222-.123-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23a11.53 11.53 0 013.003-.404c1.02.004 2.045.137 3.003.404 2.29-1.552 3.296-1.23 3.296-1.23.653 1.652.241 2.873.118 3.176.77.84 1.233 1.912 1.233 3.222 0 4.61-2.805 5.625-5.476 5.921.429.37.813 1.103.813 2.222 0 1.604-.014 2.896-.014 3.286 0 .322.216.7.825.58C20.565 21.796 24 17.3 24 12c0-6.63-5.373-12-12-12z"/>
          </svg>
          GitHub
        </a>
      </div>
    </div>
  `;
}

// --------- Load Queues ---------
async function loadAllQueues() {
  const queueContainer = document.getElementById("queues");
  const queueLoading = document.getElementById("queueLoading");
  queueContainer.innerHTML = "";
  queueLoading.textContent = "Loading queues...";

  try {
    const res = await fetch(`${API_BASE}/queues/all`);
    const { queues, dlqs, pqueues } = await res.json();

    queueLoading.textContent = "";

    if (queues.length + dlqs.length + pqueues.length === 0) {
      queueContainer.innerHTML =
        "<p class='text-gray-400 italic'>No queues, DLQs, or priority queues found.</p>";
      return;
    }

    renderQueueButtons(queueContainer, "Queues", queues, "queue-btn", "bg-gray-100 hover:bg-gray-200");
    renderQueueButtons(queueContainer, "DLQs", dlqs, "dlq-btn", "bg-gray-100 hover:bg-gray-200");
    renderQueueButtons(queueContainer, "Priority Queues", pqueues, "pqueue-btn", "bg-gray-100 hover:bg-gray-200");

  } catch (err) {
    queueLoading.textContent = `Error loading queues: ${err.message}`;
  }
}

function renderQueueButtons(container, title, items, btnClass, hoverClass) {
  if (items.length === 0) return;

  const buttons = items.map(key => `
    <button
      onclick="selectQueue(this, '${key}')"
      class="my-1 ${btnClass} ${hoverClass} text-black font-medium px-3 py-2 rounded text-left w-full transition"
    >${key}</button>
  `).join("");

  container.innerHTML += `<div class="mb-4"><strong class="text-gray-700 uppercase text-sm">${title}</strong>${buttons}</div>`;
}

// --------- Select Queue ---------
function selectQueue(button, name) {
  if (selectedButton) selectedButton.classList.remove("selected", "selected-dlq", "selected-pqueue");
  selectedButton = button;

  if (button.classList.contains("queue-btn")) button.classList.add("selected");
  else if (button.classList.contains("dlq-btn")) button.classList.add("selected-dlq");
  else if (button.classList.contains("pqueue-btn")) button.classList.add("selected-pqueue");

  loadQueue(name);
}

// --------- Load Queue Content ---------
async function loadQueue(name) {
  const content = document.getElementById("content");
  content.innerHTML = "<p class='text-center text-gray-500 mt-10 text-lg'>Loading...</p>";

  try {
    const isDLQ = name.startsWith("dlq:");
    const queueName = name.replace(/^queue:|^dlq:|^pqueue:/, "");

    const [jobsRes, dlqRes] = await Promise.all([
      fetch(`${API_BASE}/queue/${queueName}/jobs`),
      fetch(`${API_BASE}/queue/${queueName}/dlq`),
    ]);

    const jobs = await jobsRes.json();
    const dlq = await dlqRes.json();

    content.innerHTML = `
      ${!isDLQ ? renderSection("Queue", queueName, jobs, "No jobs in this queue.") : ""}
      ${renderSection("DLQ", queueName, dlq, "No failed jobs in DLQ.")}
    `;
  } catch (err) {
    content.innerHTML = `<p class="text-red-500 text-center mt-10 text-lg">Error loading queue: ${err.message}</p>`;
  }
}

// --------- Render Sections & Table ---------
function renderSection(title, name, items, emptyMsg) {
  return `
    <div class="bg-white shadow rounded-lg p-5 mb-6">
      <h2 class="text-xl font-semibold mb-2">${title}: ${name}</h2>
      <p class="text-sm text-gray-500 mb-4">${items.length} job(s)</p>
      ${items.length === 0 ? `<p class="text-gray-400 italic">${emptyMsg}</p>` : renderTable(items)}
    </div>
  `;
}

function renderTable(items) {
  const allKeys = Array.from(new Set(items.flatMap(job => Object.keys(job))));

  return `
    <div class="overflow-x-auto">
      <table class="min-w-full border border-gray-200 rounded text-sm table-auto">
        <thead class="bg-gray-100">
          <tr>
            ${allKeys.map(key => `<th class="text-left px-4 py-2 border-b font-medium text-gray-700">${key}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${items.map((job, i) => `
            <tr class="${i % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100">
              ${allKeys.map(key => `
                <td class="px-4 py-2 border-b text-gray-700 align-top">
                  ${typeof job[key] === "object" ? `<pre class='bg-gray-100 p-2 rounded text-xs overflow-x-auto'>${JSON.stringify(job[key], null, 2)}</pre>` : job[key] ?? ""}
                </td>
              `).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}