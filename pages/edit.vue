<template>
    <div>	
		<polygon-edit></polygon-edit>
    </div>
</template>

<script>
import Util from "@/mixing/util";
import UserService from "@/services/user.service";
import PolygonEdit from "../components/PolygonEdit.vue";
import AreaService from "../area.service";


export default {
	name: "edit",
	mixins: [Util],
	components: {
		PolygonEdit,
	},
}

		
</script>

<style scoped>
</style>
