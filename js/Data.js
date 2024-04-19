import NavData from "https://mospolynavigation.github.io/navigationData/NavData.js"
// import NavData from "http://127.0.0.1:5500/NavData.js"

export default class Data {
	campuses = new Map()
	plans = new Map()
	status = false
	importedVertexes = []

	constructor() {

	}

	async getData() {
		function concatVertexesFromAllPlans(plans) {
			let vertexes = []
			for (const planData of plans.values()) {
				vertexes.push(...planData.graph)
			}
			return vertexes
		}

		await NavData.loadCampusesDataAsync().then(
			resultData => {
				this.plans = resultData.plans
				this.campuses = resultData.campuses
				this.importedVertexes = concatVertexesFromAllPlans(this.plans)
				this.status = true
				console.log('Данные загружены', this)
			}
		)
	}
	
	getPlan(planName = '') {
		return this.plans.get(planName)
	}
}