<script setup>
import { onMounted, ref } from "vue";
import api from "../service/axios";

const users = ref([]);
const loading = ref(false);
const error = ref("");

const fetchUsers = async () => {
  loading.value = true;
  error.value = "";

  try {
    const res = await api.get("/users");
    users.value = res.data;
  } catch (err) {
    error.value = err.response?.data?.message || "Could not load users";
  } finally {
    loading.value = false;
  }
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/";
};

onMounted(fetchUsers);
</script>

<template>
  <div class="container">
    <div class="card">
      <div class="header">
        <h1>Users</h1>
        <button class="logout" @click="logout">Logout</button>
      </div>

      <p v-if="loading">Loading...</p>
      <p v-else-if="error" class="error">{{ error }}</p>

      <table v-else>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.name }}</td>
          </tr>
        </tbody>
      </table>

      <p v-if="!loading && !error && users.length === 0">No users yet.</p>
    </div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 40px 20px;
  background: #f3f4f6;
}

.card {
  width: 100%;
  max-width: 600px;
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

h1 {
  margin: 0;
}

.logout {
  padding: 8px 14px;
  border: none;
  background: #409eff;
  color: white;
  border-radius: 6px;
  cursor: pointer;
}

.logout:hover {
  background: #1976d2;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background: #f9fafb;
}

.error {
  color: red;
}
</style>
