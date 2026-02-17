<script>
    let datasets = [
    { id: 1, name: 'First' },
    { id: 2, name: 'Second' },
    { id: 3, name: 'Third' }
  ];
</script>

<div class="data">
    <h1>Dataset page</h1>
    <hr>
    <p>Upload your dataset here:</p>
    <input type="file" placeholder="Upload here!" />
    <hr>
    <div>
        <h2>Select dataset</h2>
        <!--<button></button>-->
        {#each datasets as dataset (dataset.id)}
          <button>{dataset.name}</button>
        {/each}
    </div>
</div>

<style>
    .data {
        padding: 20px;
    }
</style>
