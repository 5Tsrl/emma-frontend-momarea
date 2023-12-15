<template>
    <div>
        <b-table :items="companies" :fields="fields"></b-table>
    </div>
</template>

<script>
export default {
    data() {
        return {
            companies: [
                { id: 1, name: 'Company A', moma_area: 'Area 1' },
                { id: 2, name: 'Company B', moma_area: 'Area 2' },
                { id: 3, name: 'Company C', moma_area: 'Area 1' },
                // Add more companies here
            ],
            fields: [
                { key: 'id', label: 'ID' },
                { key: 'name', label: 'Name' },
                { key: 'moma_area', label: 'Moma Area' },
            ],
        };
    },
};
</script>
