<script setup>
import { ref } from "vue";
import api from "../service/axios";

const name = ref("");
const password = ref("");

const loading = ref(false);
const error = ref("");
const success = ref("");

const login = async () => {
  error.value = "";
  success.value = "";
  loading.value = true;

  try {
    const res = await api.post("/login", {
      name: name.value,
      password: password.value,
    });

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    success.value = res.data.message;

    if (success.value) {
      // Redirect to home page after successful login
      window.location.href = "/home";
    }
  } catch (err) {
    error.value =
      err.response?.data?.message || "Login failed";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="container">
    <div class="login-card">
      <h2>Login</h2>

      <div class="form-group">
        <label>Username</label>
        <input
          v-model="name"
          type="text"
          placeholder="Enter username"
        />
      </div>

      <div class="form-group">
        <label>Password</label>
        <input
          v-model="password"
          type="password"
          placeholder="Enter password"
          @keyup.enter="login"
        />
      </div>

      <button @click="login" :disabled="loading">
        {{ loading ? "Logging in..." : "Login" }}
      </button>

      <p class="success" v-if="success">
        {{ success }}
      </p>

      <p class="error" v-if="error">
        {{ error }}
      </p>
    </div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f3f4f6;
}

.login-card {
  width: 350px;
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,.1);
}

h2 {
  text-align: center;
  margin-bottom: 25px;
}

.form-group {
  margin-bottom: 18px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  outline: none;
}

input:focus {
  border-color: #409eff;
}

button {
  width: 100%;
  padding: 12px;
  border: none;
  background: #409eff;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background: #1976d2;
}

button:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.success {
  margin-top: 15px;
  color: green;
  text-align: center;
}

.error {
  margin-top: 15px;
  color: red;
  text-align: center;
}
</style>