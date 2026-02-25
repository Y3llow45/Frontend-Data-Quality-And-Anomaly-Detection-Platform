<script>
  import { login, storeToken } from '$lib/auth.js';
  import { goto } from '$app/navigation';
  let usernameOrEmail = '';
  let password = '';
  let errorMessage = '';
  let usernameOrEmailError = '';
  let passwordError = '';
  function validate() {
    let valid = true;
    usernameOrEmailError = '';
    passwordError = '';
    if (!usernameOrEmail) {
      usernameOrEmailError = 'Username or Email is required';
      valid = false;
    }
    if (!password) {
      passwordError = 'Password is required';
      valid = false;
    }
    return valid;
  }
  async function handleSubmit() {
    errorMessage = '';
    if (!validate()) return;
    try {
      const response = await login({ usernameOrEmail, password });
      storeToken(response.token);
      goto('/home');
    } catch (err) {
      errorMessage = err.message || 'Login failed';
    }
  }
</script>

<div class="container">
  <h1>Login</h1>
  <form on:submit|preventDefault={handleSubmit}>
    <div>
      <label for="usernameOrEmail">Username or Email</label>
      <input type="text" id="usernameOrEmail" bind:value={usernameOrEmail} />
      {#if usernameOrEmailError}<p class="error">{usernameOrEmailError}</p>{/if}
    </div>
    <div>
      <label for="password">Password</label>
      <input type="password" id="password" bind:value={password} />
      {#if passwordError}<p class="error">{passwordError}</p>{/if}
    </div>
    {#if errorMessage}<p class="error">{errorMessage}</p>{/if}
    <button type="submit">Login</button>
  </form>
</div>

<style>
  .container { max-width: 400px; margin: 0 auto; padding: 20px; }
  .error { color: red; font-size: 0.9em; }
  input { width: 100%; margin-bottom: 10px; }
  button { width: 100%; }
</style>
