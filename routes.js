import DashboardLayout from "~theme/DashboardLayout.vue";

const pages = import.meta.glob("./pages/**/*.vue", { eager: true });

function pageComponent(name) {
	const mod = pages[`./pages/${name}.vue`];
	if (!mod) {
		throw new Error(`pageComponent: ${name} not found in this module's pages/`);
	}
	return mod.default;
}



const routes = [
    {
		path: "/",
		component: DashboardLayout,
		redirect: "/dashboard",
		children: [
			{
				path: "/momarea",
				name: "Spazi di Moma Area",
				meta: { authorize: ["admin","moma_area"]  },
				// lazy-loaded
				component: pageComponent("index"),
			},	
			{
				path: "/momarea/edit/:id",
				name: "Edit Spazi di Moma Area",
				meta: { authorize: ["admin"] },
				// lazy-loaded
				component: pageComponent("edit"),
			},			
			{
				path: "/momarea/add",
				name: "Aggiungi Spazi di Moma Area",
				meta: { authorize: ["admin"] },
				// lazy-loaded
				component: pageComponent("add"),
			},
			// Add your new route here
			{
				path: "/momarea/export",
				name: "Export Spazi di Moma Area",
				meta: { authorize: ["admin","moma_area"] },
				// lazy-loaded
				component: pageComponent("export"),
			},
			// Add your new route here
			{
				path: "/momarea/psclist",
				name: "Pscl dagli Spazi di Moma Area",
				meta: { authorize: ["admin","moma_area"] },
				// lazy-loaded
				component: pageComponent("psclist"),
			},
		]
	}
];

export default routes;