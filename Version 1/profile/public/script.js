document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('profile-form');
    const editButton = document.getElementById('edit-button');
    const editTab = document.getElementById('edit-tab');
    const profilePicInput = document.getElementById('profile-pic-input');
    const profilePic = document.getElementById('profile-pic');
  
    // Fetch the profile information when the page loads
    fetch('/profile')
      .then(response => response.json())
      .then(data => {
        document.getElementById('profile-name').textContent = data.name;
        document.getElementById('profile-email').textContent = data.email;
        document.getElementById('profile-phone').textContent = data.phone;
        document.getElementById('profile-plan').textContent = data.plan;
        document.getElementById('profile-expiry').textContent = data.expiry;
        document.getElementById('profile-devices').textContent = data.devices;
        profilePic.src = data.profilePicUrl;
      });
  
    // Toggle edit tab visibility
    editButton.addEventListener('click', () => {
      editTab.classList.toggle('active');
    });
  
    // Handle form submission
    form.addEventListener('submit', function (e) {
      e.preventDefault();
  
      const updatedProfile = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        plan: document.getElementById('plan').value,
        expiry: document.getElementById('expiry').value,
        devices: document.getElementById('devices').value,
      };
  
      // Send the updated profile data to the server
      fetch('/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProfile),
      })
        .then(response => response.json())
        .then(data => alert(data.message));
    });
  
    // Handle profile picture upload
    profilePicInput.addEventListener('change', function (e) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('profilePic', file);
  
      fetch('/upload-profile-pic', {
        method: 'POST',
        body: formData,
      })
        .then(response => response.json())
        .then(data => {
          profilePic.src = data.profilePicUrl;
          alert('Profile picture updated!');
        });
    });
  });
  
