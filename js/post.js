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