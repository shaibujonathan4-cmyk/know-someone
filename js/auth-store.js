const AuthStore = {

  async signup(name, email, password) {
    try {
      const cred = await auth.createUserWithEmailAndPassword(email, password);
      const uid = cred.user.uid;

      await db.collection('users').doc(uid).set({
        name,
        email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      return { success: true, uid };
    } catch (err) {
      return { success: false, message: this.friendlyError(err) };
    }
  },

  async login(email, password) {
    try {
      const cred = await auth.signInWithEmailAndPassword(email, password);
      return { success: true, uid: cred.user.uid };
    } catch (err) {
      return { success: false, message: this.friendlyError(err) };
    }
  },

  async logout() {
    await auth.signOut();
  },

  // Returns { uid, email, name } or null. Waits for Firebase to resolve auth state first.
  async getCurrentUser() {
    const user = await new Promise(resolve => {
      const unsubscribe = auth.onAuthStateChanged(u => {
        unsubscribe();
        resolve(u);
      });
    });

    if (!user) return null;

    const doc = await db.collection('users').doc(user.uid).get();
    const profile = doc.exists ? doc.data() : {};

    return { uid: user.uid, email: user.email, name: profile.name || '' };
  },

  async isLoggedIn() {
    const user = await this.getCurrentUser();
    return !!user;
  },

  // Redirects to login if no one is signed in. Call this at the top of any protected page.
  // `pathToLogin` should be the relative path to login.html from the current page.
  async requireAuth(pathToLogin) {
    const user = await this.getCurrentUser();
    if (!user) {
      window.location.href = pathToLogin;
    }
    return user;
  },

  friendlyError(err) {
    switch (err.code) {
      case 'auth/email-already-in-use': return 'An account with this email already exists.';
      case 'auth/invalid-email': return 'That email address looks invalid.';
      case 'auth/weak-password': return 'Password should be at least 6 characters.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential': return 'Invalid email or password.';
      default: return `Something went wrong (${err.code || 'unknown'}): ${err.message || err}`;
    }
  }

};