<script>
  import { onMount, onDestroy } from 'svelte';
  import { getToken } from '$lib/auth.js';
  import { apiFetch, apiUpload } from '$lib/api.js';

  let datasets = [];
  let selectedDatasetId = null;
  let versions = [];
  let selectedVersionId = null;
  let versionDetails = null; // { version, stats, anomalies }
  let loading = false;
  let errorMsg = '';

  let datasetName = '';
  let file = null;
  let uploading = false;
  let pollingInterval;

  onMount(async () => {
    const token = getToken();
    if (!token) {
      window.location.href = '/login';
      return;
    }
    await fetchDatasets();
  });

  onDestroy(() => {
    if (pollingInterval) clearInterval(pollingInterval);
  });

  async function fetchDatasets() {
    loading = true;
    errorMsg = '';
    try {
      datasets = await apiFetch('/api/datasets', 'GET', null, getToken());
    } catch (err) {
      errorMsg = err.message;
    } finally {
      loading = false;
    }
  }

  async function fetchVersions(datasetId) {
    selectedDatasetId = datasetId;
    selectedVersionId = null;
    versionDetails = null;
    loading = true;
    errorMsg = '';
    try {
      versions = await apiFetch(`/api/datasets/${datasetId}/versions`, 'GET', null, getToken());
    } catch (err) {
      errorMsg = err.message;
    } finally {
      loading = false;
    }
  }

  async function fetchVersionDetails(versionId) {
    selectedVersionId = versionId;
    loading = true;
    errorMsg = '';
    try {
      versionDetails = await apiFetch(`/api/datasets/versions/${versionId}/status`, 'GET', null, getToken());
    } catch (err) {
      errorMsg = err.message;
    } finally {
      loading = false;
    }
  }

  function handleFileChange(event) {
    file = event.target.files[0];
  }

  async function handleUpload() {
    if (!datasetName || !file) {
      alert('Please provide a dataset name and select a CSV file.');
      return;
    }
    uploading = true;
    errorMsg = '';
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiUpload(`/api/datasets/${datasetName}/upload`, formData, getToken());
      const versionId = res.versionId;
      pollingInterval = setInterval(() => pollStatus(versionId), 5000);
      await pollStatus(versionId);
    } catch (err) {
      errorMsg = err.message;
    } finally {
      uploading = false;
    }
  }

  async function pollStatus(versionId) {
    try {
      const details = await apiFetch(`/api/datasets/versions/${versionId}/status`, 'GET', null, getToken());
      versionDetails = details;
      if (details.version.status === 'DONE' || details.version.status === 'FAILED') {
        clearInterval(pollingInterval);
        pollingInterval = null;
        await fetchDatasets();
        const newDataset = datasets.find(d => d.name === datasetName);
        if (newDataset) {
          await fetchVersions(newDataset.id);
          const newVersion = versions.find(v => v.id === versionId);
          if (newVersion) {
            selectedVersionId = versionId;
          }
        }
      }
    } catch (err) {
      errorMsg = err.message;
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  }
</script>

<main class="p-4">
  <h1 class="text-2xl font-bold mb-4">Datasets</h1>

  {#if errorMsg}
    <p class="text-red-500">{errorMsg}</p>
  {/if}

  {#if loading}
    <p>Loading...</p>
  {/if}

  <section class="mb-8">
    <h2 class="text-xl font-semibold mb-2">Upload CSV Dataset</h2>
    <form on:submit|preventDefault={handleUpload}>
      <input type="text" bind:value={datasetName} placeholder="Dataset Name" class="border p-2 mr-2" required />
      <input type="file" accept=".csv" on:change={handleFileChange} class="border p-2 mr-2" required />
      <button type="submit" disabled={uploading} class="bg-blue-500 text-white p-2">
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </form>
  </section>

  <section class="mb-8">
    <h2 class="text-xl font-semibold mb-2">Your Datasets</h2>
    <table class="border-collapse border w-full">
      <thead>
        <tr>
          <th class="border p-2">Name</th>
          <th class="border p-2">Created At</th>
          <th class="border p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each datasets as dataset}
          <tr>
            <td class="border p-2">{dataset.name}</td>
            <td class="border p-2">{new Date(dataset.createdAt).toLocaleString()}</td>
            <td class="border p-2">
              <button on:click={() => fetchVersions(dataset.id)} class="bg-green-500 text-white p-1">View Versions</button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </section>

  {#if selectedDatasetId}
    <section class="mb-8">
      <h2 class="text-xl font-semibold mb-2">Versions for Dataset ID: {selectedDatasetId}</h2>
      <table class="border-collapse border w-full">
        <thead>
          <tr>
            <th class="border p-2">ID</th>
            <th class="border p-2">Row Count</th>
            <th class="border p-2">Status</th>
            <th class="border p-2">Created At</th>
            <th class="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each versions as version}
            <tr>
              <td class="border p-2">{version.id}</td>
              <td class="border p-2">{version.rowCount ?? 'N/A'}</td>
              <td class="border p-2">{version.status}</td>
              <td class="border p-2">{new Date(version.createdAt).toLocaleString()}</td>
              <td class="border p-2">
                <button on:click={() => fetchVersionDetails(version.id)} class="bg-blue-500 text-white p-1">View Details</button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </section>
  {/if}

  {#if selectedVersionId && versionDetails}
    <section>
      <h2 class="text-xl font-semibold mb-2">Details for Version ID: {selectedVersionId}</h2>
      <p>Status: {versionDetails.version.status}</p>
      <p>Row Count: {versionDetails.version.rowCount ?? 'N/A'}</p>

      <h3 class="text-lg font-semibold mt-4 mb-2">Column Stats</h3>
      <table class="border-collapse border w-full">
        <thead>
          <tr>
            <th class="border p-2">Column Name</th>
            <th class="border p-2">Type</th>
            <th class="border p-2">Null Rate</th>
            <th class="border p-2">Distinct Count</th>
            <th class="border p-2">Min</th>
            <th class="border p-2">Max</th>
            <th class="border p-2">Avg</th>
            <th class="border p-2">Std Dev</th>
          </tr>
        </thead>
        <tbody>
          {#each versionDetails.stats as stat}
            <tr>
              <td class="border p-2">{stat.columnName}</td>
              <td class="border p-2">{stat.type}</td>
              <td class="border p-2">{(stat.nullRate * 100).toFixed(2)}%</td>
              <td class="border p-2">{stat.distinctCount ?? 'N/A'}</td>
              <td class="border p-2">{stat.minValue ?? 'N/A'}</td>
              <td class="border p-2">{stat.maxValue ?? 'N/A'}</td>
              <td class="border p-2">{stat.avg ?? 'N/A'}</td>
              <td class="border p-2">{stat.stddev ?? 'N/A'}</td>
            </tr>
          {/each}
        </tbody>
      </table>

      <h3 class="text-lg font-semibold mt-4 mb-2">Anomalies</h3>
      <table class="border-collapse border w-full">
        <thead>
          <tr>
            <th class="border p-2">Column Name</th>
            <th class="border p-2">Anomaly Type</th>
            <th class="border p-2">Severity</th>
            <th class="border p-2">Details</th>
          </tr>
        </thead>
        <tbody>
          {#each versionDetails.anomalies as anomaly}
            <tr class:bg-red-100={anomaly.severity === 'HIGH'} class:bg-yellow-100={anomaly.severity === 'MEDIUM'} class:bg-green-100={anomaly.severity === 'LOW'}>
              <td class="border p-2">{anomaly.columnName}</td>
              <td class="border p-2">{anomaly.anomalyType}</td>
              <td class="border p-2">{anomaly.severity}</td>
              <td class="border p-2">{anomaly.details}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </section>
  {/if}
</main>
