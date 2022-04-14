class DOMHelper {
	static clearEventListeners(element) {
		const clonedElement = element.cloneNode(true);
		element.replaceWith(clonedElement);
		return clonedElement;
	}
	static moveElement(elementId, newDestinationSelector) {
		const element = document.getElementById(elementId);
		const destinationElement = document.querySelector(newDestinationSelector);
		destinationElement.append(element);
	}
}

class Tooltip {
	detach() {
		this.element.remove();
		// Old way that is compatible with all browsers
		// this.element.parentElement.removeChild(this.element);
	}

	attach() {
		const tooltipElement = document.createElement("div");
		tooltipElement.className = "card";
		tooltipElement.textContent = "DUMMY";
		tooltipElement.addEventListener("click", this.detach.bind(this));
		this.element = tooltipElement;
		document.body.append(tooltipElement);
	}
}

class ProjectItem {
	constructor(id, updateProjectListsFunction, type) {
		this.id = id;
		this.updateProjectListsHandler = updateProjectListsFunction;
		this.connectMoreInfoButton();
		this.connectSwitchButton(type);
	}

	showMoreInfoHandler() {
		const tooltip = new Tooltip();
		tooltip.attach();
	}

	connectMoreInfoButton() {
		const projectItemElement = document.getElementById(this.id);
		const moreInfoBtn = projectItemElement.querySelector(
			"button:first-of-type"
		);
		moreInfoBtn.addEventListener("click", this.showMoreInfoHandler);
	}

	connectSwitchButton(type) {
		const projectItemElement = document.getElementById(this.id);
		let switchBtn = projectItemElement.querySelector("button:last-of-type");
		switchBtn = DOMHelper.clearEventListeners(switchBtn);
		switchBtn.textContent = type === "active" ? "Finish" : "Activate";
		switchBtn.addEventListener(
			"click",
			this.updateProjectListsHandler.bind(null, this.id)
		);
	}

	update(updateProjectListsFunction, type) {
		this.updateProjectListsHandler = updateProjectListsFunction;
		this.connectSwitchButton(type);
	}
}

class ProjectList {
	projects = [];

	constructor(type) {
		this.type = type;

		const prjItems = document.querySelectorAll(`#${type}-projects li`);
		for (const prjItem of prjItems) {
			this.projects.push(
				new ProjectItem(prjItem.id, this.switchProject.bind(this), this.type)
			);
		}
		console.log(this.projects);
	}

	setSwitchHandlerFunction(switchHandlerFunction) {
		this.switchHandler = switchHandlerFunction;
	}

	addProject(project) {
		this.projects.push(project);
		DOMHelper.moveElement(project.id, `#${this.type}-projects ul`);
		project.update(this.switchProject.bind(this), this.type);
	}

	switchProject(projectId) {
		// One way of removing it
		// const projectIndex = this.projects.findIndex((p) => p.id === projectId);
		// this.projects.splice(projectIndex, 1);
		this.switchHandler(this.projects.find((p) => p.id === projectId));
		this.projects = this.projects.filter((p) => p.id !== projectId);
	}
}

class App {
	static init() {
		const activeProjectsList = new ProjectList("active");
		const finishedProjectsList = new ProjectList("finished");
		activeProjectsList.setSwitchHandlerFunction(
			finishedProjectsList.addProject.bind(finishedProjectsList)
		);
		finishedProjectsList.setSwitchHandlerFunction(
			activeProjectsList.addProject.bind(activeProjectsList)
		);
	}
}

App.init();
