document.addEventListener('DOMContentLoaded', () => {
    // Data simulation
    const data = {
      ous: [
        { id: 1, name: "Headquarters" },
        { id: 2, name: "IT Department", parentId: 1 },
        { id: 3, name: "HR Department", parentId: 1 },
        { id: 4, name: "Sales Department", parentId: 1 },
      ],
      users: [
        { id: 1, username: "alice", email: "alice@example.com", ouId: 2 },
        { id: 2, username: "bob", email: "bob@example.com", ouId: 3 },
        { id: 3, username: "carol", email: "carol@example.com", ouId: 2 },
        { id: 4, username: "dave", email: "dave@example.com", ouId: 4 },
      ],
    };
  
    // Elements
    const ouTreeEl = document.getElementById('ou-tree');
    const ouSelectEl = document.getElementById('ou-select');
    const userListEl = document.getElementById('user-list');
    const addUserBtn = document.getElementById('add-user-btn');
    const addUserModal = new bootstrap.Modal(document.getElementById('addUserModal'));
    const addUserForm = document.getElementById('add-user-form');
    let selectedOuId = data.ous[0].id;
  
    // Render OU Tree textually
    function buildTree(parentId = null, level = 0) {
      let treeStr = '';
      data.ous.filter(ou => (ou.parentId || null) === parentId).forEach(ou => {
        treeStr += ' '.repeat(level * 4) + '- ' + ou.name + '\n';
        treeStr += buildTree(ou.id, level + 1);
      });
      return treeStr;
    }
    ouTreeEl.textContent = buildTree();
  
    // Populate OU select dropdown
    function populateOuSelect() {
      ouSelectEl.innerHTML = '';
      data.ous.forEach(ou => {
        const option = document.createElement('option');
        option.value = ou.id;
        option.textContent = ou.name;
        ouSelectEl.appendChild(option);
      });
      ouSelectEl.value = selectedOuId;
    }
  
    // Render users list of selected OU
    function renderUsers() {
      userListEl.innerHTML = '';
      const users = data.users.filter(u => u.ouId == selectedOuId);
      if (users.length === 0) {
        userListEl.innerHTML = '<li class="list-group-item">No users found in this OU.</li>';
        return;
      }
      users.forEach(user => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.textContent = `${user.username} (${user.email})`;
  
        // Delete button
        const delBtn = document.createElement('button');
        delBtn.className = 'btn btn-sm btn-danger';
        delBtn.textContent = 'Delete';
        delBtn.onclick = () => {
          if (confirm(`Delete user ${user.username}?`)) {
            data.users = data.users.filter(u => u.id !== user.id);
            renderUsers();
            updateChart();
          }
        };
  
        li.appendChild(delBtn);
        userListEl.appendChild(li);
      });
    }
  
    // Add user form submit
    addUserForm.addEventListener('submit', e => {
      e.preventDefault();
      const username = document.getElementById('username').value.trim();
      const email = document.getElementById('useremail').value.trim();
      if (!username || !email) return;
  
      const newUser = {
        id: Date.now(),
        username,
        email,
        ouId: selectedOuId,
      };
      data.users.push(newUser);
      addUserForm.reset();
      addUserModal.hide();
      renderUsers();
      updateChart();
    });
  
    // OU select change event
    ouSelectEl.addEventListener('change', () => {
      selectedOuId = parseInt(ouSelectEl.value);
      renderUsers();
    });
  
    // Initialize Chart.js
    const ctx = document.getElementById('userChart').getContext('2d');
    let userChart;
  
    function updateChart() {
      const labels = data.ous.map(ou => ou.name);
      const counts = data.ous.map(ou => data.users.filter(u => u.ouId === ou.id).length);
  
      if (userChart) userChart.destroy();
      userChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Users per OU',
            data: counts,
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            borderRadius: 5,
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true, precision: 0 }
          },
          plugins: {
            legend: { display: true }
          }
        }
      });
    }
  
    // Init
    populateOuSelect();
    renderUsers();
    updateChart();
  
    // Add user button click
    addUserBtn.addEventListener('click', () => addUserModal.show());
  });
  