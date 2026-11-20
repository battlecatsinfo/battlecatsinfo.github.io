import fs from "fs";
import path from "path";
import {tmpdir} from "os";
import {fileURLToPath} from "url";
import {parseArgs} from "util";

import Mocha from "mocha";
import {Builder} from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import firefox from "selenium-webdriver/firefox.js";

const currentFile = fileURLToPath(import.meta.url);
const rootDir = path.dirname(currentFile);

const POLL_INTERVAL = 300;

let context = null;

async function launchDriver({profileDirectory, browserName, exePath, headless, incognito}) {
	if (browserName === "chromium") {
		const options = new chrome.Options();
		if (exePath) { options.setBinaryPath(exePath); }
		if (headless) { options.addArguments("--headless=new"); }
		options.addArguments(`--user-data-dir=${profileDirectory}`);
		options.addArguments("--log-level=3");
		options.addArguments("--no-first-run");
		options.addArguments("--disable-backgrounding-occluded-windows");
		options.addArguments("--disable-background-timer-throttling");
		options.addArguments("--disable-background-networking");
		options.addArguments("--disable-default-apps");

		return {
			driver: await new Builder()
				.forBrowser("chrome")
				.setChromeOptions(options)
				.build(),
			options,
		};
	}

	if (browserName === "firefox") {
		const options = new firefox.Options();
		if (exePath) { options.setBinary(exePath); }
		if (headless) { options.addArguments("-headless"); }
		if (incognito) { options.addArguments("-private-window"); }
		options.addArguments("-profile", profileDirectory);

		// disable auto update
		options.setPreference("app.update.auto", false);
		options.setPreference("app.update.enabled", false);
		options.setPreference("app.update.silent", false);
		options.setPreference("app.update.mode", 0);
		options.setPreference("app.update.service.enabled", false);
		options.setPreference("app.update.background.interval", 0);

		return {
			driver: await new Builder()
				.forBrowser("firefox")
				.setFirefoxOptions(options)
				.build(),
			options,
		};
	}

	throw new Error(`Unsupported browser: ${browserName}`);
}

async function runTestSuite({browserName, exePath, headless, incognito, grep, dryRun, reporter, keepOpen}) {
	const profileDirectory = await fs.mkdtempSync(path.join(tmpdir(), "battlecatsinfo-tests-"));

	let driver = null;
	let failed;

	try {
		console.debug("Launching browser with profile: %s", profileDirectory);
		const {driver: newDriver, options} = await launchDriver({profileDirectory, browserName, exePath, headless, incognito});
		driver = newDriver;

		// run tests
		const baseUrl = "http://localhost:8080/";
		context = {driver, baseUrl, grep, reporter};
		const mocha = new Mocha({
			grep,
			reporter,
			dryRun,
			timeout: 60000,
			slow: 10000,
		});
		mocha.addFile(path.resolve(rootDir, "./test_browser.mjs"));

		await mocha.loadFilesAsync();
		const failures = await new Promise((resolve) => mocha.run(resolve));
		failed = failures > 0;
	} catch (ex) {
		console.error(ex);
		failed = true;
	} finally {
		if (driver) {
			if (keepOpen) {
				console.debug("Waiting for browser shutdown ...");
				while (true) {
					try {
						await driver.getAllWindowHandles();
					} catch {
						break;
					}
					await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
				}
			} else {
				console.debug("Shutting down browser ...");
				await driver.quit();
			}
		}

		console.debug("Removing profile directory ...");
		await fs.rmSync(profileDirectory, {recursive: true, force: true});
	}

	return failed;
}

function isMain() {
	const entryFile = process.argv[1];
	if (!entryFile) { return false; }
	return currentFile === path.resolve(entryFile);
}

async function main() {
	const args = parseArgs({
		options: {
			"help": {
				type: "boolean",
				short: "h",
			},
			"browser": {
				type: "string",
				default: "chromium",
				short: "b",
			},
			"exe-path": {
				type: "string",
				short: "e",
			},
			"headed": {
				type: "boolean",
			},
			"incognito": {
				type: "boolean",
			},
			"keep": {
				type: "boolean",
			},
			"grep": {
				type: "string",
				default: "",
				short: "g",
			},
			"dry-run": {
				type: "boolean",
			},
			"verbose": {
				type: "boolean",
				short: "v",
			},
		},
	});

	if (args.values.help) {
		const usage = `\
Usage: npm run test [-- [options ...]]

Options:
  -h, --help             Display usage help.
  -b, --browser BROWSER  The browser to test. {chromium,firefox}
  -e, --exe-path PATH    The browser executable path.
  --headed               Launch the browser headedly.
  --incognito            Launch the browser in incognito (private) mode.
  --keep                 Keep the browser open after tests done.
  -g, --grep PATTERN     The matching regex pattern for tests to run.
  --dry-run              Report tests without executing them
  -v, --verbose          Show verbose output.
`;
		process.stdout.write(usage);
		process.exit(0);
	}

	const failed = await runTestSuite({
		browserName: args.values["browser"],
		exePath: args.values["exe-path"],
		headless: !args.values["headed"],
		incognito: args.values["incognito"],
		keepOpen: args.values["keep"] && !args.values["headless"],
		grep: args.values["grep"],
		dryRun: args.values["dry-run"],
		reporter: args.values["verbose"] ? "spec" : "dot",
	});

	if (failed) {
		process.exitCode = 1;
	}
}

if (isMain()) {
	main();
}

export {
	POLL_INTERVAL,
	context,
};
