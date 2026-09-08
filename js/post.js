document.addEventListener('DOMContentLoaded', async () => {

  const user = await AuthStore.requireAuth('login.html');
  if (!user) return;

  const form = document.getElementById('postForm');
  const urgencyBtns = document.querySelectorAll('.urgency-btn');
  const rewardInput = document.getElementById('reward');
  const walletNote = document.getElementById('walletNote');
  const submitBtn = document.getElementById('submitBtn');
  const backBtn = document.getElementById('backBtn');
  const useLocationBtn = document.getElementById('useLocationBtn');
  const locationInput = document.getElementById('location');
  const locationStatus = document.getElementById('locationStatus');

  let urgency = 'urgent'; // default matches the .active button in HTML

  const wallet = await WalletStore.getWallet();
  walletNote.innerHTML = `Wallet balance: <strong>₦${wallet.balance.toLocaleString()}</strong> — <a href="wallet.html">Top up</a>`;

  // Urgency toggle behavior
  urgencyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      urgencyBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      urgency = btn.dataset.value;
    });
  });

  // Back navigation
  backBtn.addEventListener('click', () => {
    window.history.back();
  });

  // Geolocation — detect and reverse-geocode current location
  useLocationBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      locationStatus.textContent = 'Geolocation is not supported on this device.';
      return;
    }

    useLocationBtn.disabled = true;
    useLocationBtn.textContent = 'Detecting...';
    locationStatus.textContent = 'Getting your location...';

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const addr = data.address || {};
          const readable = [
            addr.suburb || addr.neighbourhood || addr.village,
            addr.city || addr.town || addr.county,
            addr.state
          ].filter(Boolean).join(', ');

          locationInput.value = readable || data.display_name || `${latitude}, ${longitude}`;
          locationStatus.textContent = '✓ Location detected';
        } catch (err) {
          locationInput.value = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
          locationStatus.textContent = "Detected coordinates (couldn't resolve address).";
        } finally {
          useLocationBtn.disabled = false;
          useLocationBtn.textContent = '📍 Use my location';
        }
      },
      (error) => {
        useLocationBtn.disabled = false;
        useLocationBtn.textContent = '📍 Use my location';
        if (error.code === error.PERMISSION_DENIED) {
          locationStatus.textContent = 'Location permission denied — please type your location manually.';
        } else {
          locationStatus.textContent = 'Could not detect location — please type it manually.';
        }
      }
    );
  });

  // Form submit — validate + check escrow
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const location = locationInput.value.trim();
    const reward = parseInt(rewardInput.value, 10);

    if (!title || !description || !location || !reward) {
      alert('Please fill in all fields.');
      return;
    }

    if (reward < 500) {
      alert('Reward must be at least ₦500.');
      return;
    }

    const currentWallet = await WalletStore.getWallet();
    if (reward > currentWallet.balance) {
      const shortfall = reward - currentWallet.balance;
      alert(`Insufficient wallet balance. You need ₦${shortfall.toLocaleString()} more to lock this reward.`);
      window.location.href = 'wallet.html';
      return;
    }

    const newRequest = {
      id: Date.now().toString(),
      ownerId: user.uid,
      ownerName: user.name,
      title,
      description,
      location,
      urgency,
      reward,
      status: 'open',
      claimedBy: null,
      rewardClaimed: false,
      postedAt: new Date().toISOString(),
    };

    await lockRewardAndPost(newRequest);
  });

  async function lockRewardAndPost(request) {
    const updatedWallet = await WalletStore.lockEscrow(request.reward);

    if (!updatedWallet) {
      alert('Something went wrong locking the reward. Please try again.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Lock Reward & Post';
      return;
    }

    await RequestStore.add(request);

    submitBtn.disabled = true;
    submitBtn.textContent = 'Posting...';

    setTimeout(() => {
      alert('Reward locked and request posted!');
      window.location.href = 'home.html';
    }, 600);
  }

});