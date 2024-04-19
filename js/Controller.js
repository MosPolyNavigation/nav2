import {processGraphAndPlan} from './app.js'
import {Settings} from './Settings.js'

export class Controller {
	switcherForm
	floorsSwitcherForm
	corpusesForm
	campusesForm
	floorsForm
	
	setup(switcher, floorsSwitcherForm, data, defaultPlan, planHandler) {
		this.switcherForm = switcher
		this.corpusesForm = this.switcherForm.querySelector('.corpuses')
		this.campusesForm = this.switcherForm.querySelector('.campuses')
		this.floorsSwitcherForm = floorsSwitcherForm
		this.floorsForm = this.floorsSwitcherForm.querySelector('.floors')
		
		let defaultPlanData = data.getPlan(defaultPlan)
		
		this.#fillCampuses(data)
		this.changeCampus(defaultPlanData.campus, data)
		this.changeCorpus(defaultPlanData.campus, defaultPlanData.corpus, data)
		this.changePlan(defaultPlan, data, planHandler)
	}
	
	getActiveCampus() {
		return this.switcherForm.elements.campuses.value
	}
	
	getActiveCorpus() {
		return this.switcherForm.elements.corpuses.value
	}
	
	getActivePlan() {
		return this.floorsSwitcherForm.elements.floors.value
	}
	
	#clearCorpusesList() {
		while (this.corpusesForm.getElementsByTagName('label').length !== 0) {
			this.corpusesForm.getElementsByTagName('label')[0].remove()
		}
	}

	#clearFloorsList() {
		while (this.floorsForm.getElementsByTagName('label').length !== 0) {
			this.floorsForm.getElementsByTagName('label')[0].remove()
		}
	}
	
	#fillCampuses(data) {
		for (const campusData of data.campuses.values()) {
			this.campusesForm.innerHTML += `
			<label>
				<input type="radio" name="campuses" value="${campusData.id}">
				${campusData.rusName}
			</label>`
		}
		for (const nodeLabel of this.campusesForm.getElementsByTagName('input')) {
			nodeLabel.addEventListener('change', ev => this.changeCampus(ev.target.value, data))
		}
	}
	
	#fillCorpuses(data) {
		this.#clearCorpusesList()
		let activeCampusId = this.getActiveCampus()
		let corpuses = data.campuses.get(activeCampusId).corpuses
		this.corpusesForm.setAttribute('forCampus', activeCampusId)
		for (const corpusId in corpuses) {
			this.corpusesForm.innerHTML += `
			<label>
				<input type="radio" name="corpuses" value="${corpusId}">
				${corpuses[corpusId].rusName}
			</label>`
		}
		for (const nodeLabel of this.corpusesForm.getElementsByTagName('input')) {
			nodeLabel.addEventListener('change', ev => this.changeCorpus(this.getActiveCampus(), ev.target.value, data))
		}
	}
	
	#fillFloors(data) {
		this.#clearFloorsList()
		let activeCampusId = this.getActiveCampus()
		let activeCorpusId = this.getActiveCorpus()
		for (const [planName, planData] of data.plans) {
			if (planData.campus === activeCampusId && planData.corpus === activeCorpusId) {
				this.floorsForm.innerHTML += `
				<label class="button">
					<input type="radio" name="floors" value="${planName}">
					${planData.floor}
				</label>
				`
			}
		}
	}
	
	changeCampus(campusId, data) {
		this.switcherForm.elements.campuses.value = campusId
		this.#fillCorpuses(data)
	}
	
	changeCorpus(campusId, corpusId, data) {
		if(this.getActiveCampus()!==campusId)
			this.changeCampus(campusId, data)
		this.switcherForm.elements.corpuses.value = corpusId
		this.#fillFloors(data)
	for (const nodeLabel of this.floorsForm.getElementsByTagName('input')) {
		nodeLabel.addEventListener('change', ev => this.changePlan(ev.target.value, data))
	}
	}
	
	async changePlan(planName, data) {
		let planData = data.getPlan(planName)
		this.changeCorpus(planData.campus, planData.corpus, data)
		this.floorsSwitcherForm.elements.floors.value = planName
		let svgURL = `${Settings.dataServer}${planData.svgLink}`
		console.log(`Загружаю план с ${svgURL}`)
		let fetchPlanResponse = await fetch(svgURL)
		let svgPlanTextContent = await fetchPlanResponse.text()
		processGraphAndPlan(false, svgPlanTextContent, planData)
	}
}