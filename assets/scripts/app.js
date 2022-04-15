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
		element.scrollIntoView({ behavior: "smooth" });
	}
}

class Component {
	constructor(hostElementId, insertBefore = false) {
		if (hostElementId) {
			this.hostElementId = document.getElementById(hostElementId);
		} else {
			this.hostElementId = document.body;
		}
		this.insertBefore = insertBefore;
	}
	detach() {
		this.element.remove();
		// Old way that is compatible with all browsers
		// this.element.parentElement.removeChild(this.element);
	}

	attach() {
		this.hostElementId.insertAdjacentElement(
			this.insertBefore ? "afterbegin" : "beforeend",
			this.element
		);
	}
}

class Tooltip extends Component {
	constructor(closeNotifierFunction, text, hostElementId) {
		super(hostElementId);
		this.closeNotifier = closeNotifierFunction;
		this.text = text;
		this.create();
	}

	closeTooltip() {
		this.detach();
		this.closeNotifier();
	}

	create() {
		const tooltipElement = document.createElement("div");
		tooltipElement.className = "card";
		tooltipElement.textContent = this.text;

		const hostElPosLeft = this.hostElementId.offsetLeft;
		const hostElPosTop = this.hostElementId.offsetTop;
		const hostElHeight = this.hostElementId.clientHeight;
		const parentElementScrolling = this.hostElementId.parentElement.scrollTop;

		const x = hostElPosLeft + 20;
		const y = hostElPosTop + hostElHeight - parentElementScrolling - 10;

		tooltipElement.style.position = "absolute";
		tooltipElement.style.left = x + "px";
		tooltipElement.style.top = y + "px";

		tooltipElement.addEventListener("click", this.closeTooltip.bind(this));
		this.element = tooltipElement;
	}
}

class ProjectItem {
	hasActiveTooltip = false;

	constructor(id, updateProjectListsFunction, type) {
		this.id = id;
		this.updateProjectListsHandler = updateProjectListsFunction;
		this.connectMoreInfoButton();
		this.connectSwitchButton(type);
	}

	showMoreInfoHandler() {
		if (this.hasActiveTooltip) {
			return;
		}

		const projectElement = document.getElementById(this.id);
		const tooltipText = projectElement.dataset.extraInfo;
		const tooltip = new Tooltip(
			() => {
				this.hasActiveTooltip = false;
			},
			tooltipText,
			this.id
		);
		console.log(tooltip);
		tooltip.attach();
		this.hasActiveTooltip = true;
	}

	connectMoreInfoButton() {
		const projectItemElement = document.getElementById(this.id);
		const moreInfoBtn = projectItemElement.querySelector(
			"button:first-of-type"
		);
		moreInfoBtn.addEventListener("click", this.showMoreInfoHandler.bind(this));
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
