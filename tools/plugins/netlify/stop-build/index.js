module.exports = {
  onPreBuild: ({ utils }) => {
    const disableStopBuildPlugin = process.env.DISABLE_STOP_BUILD_PLUGIN;
    if(disableStopBuildPlugin){
      console.log('Stop build plugin is disabled using the environment variable "DISABLE_STOP_BUILD_PLUGIN"')
      return;
    }

    const currentProject = process.env.PROJECT_NAME;
    if(!currentProject){
      utils.build.failBuild(`Build failed because a environment variable named "PROJECT_NAME" is required.`)
    }
    const lastDeployedCommit = process.env.CACHED_COMMIT_REF;
    const latestCommit = 'HEAD';
    const projectHasChanged = projectChanged(
      currentProject,
      lastDeployedCommit,
      latestCommit
    );
    if (!projectHasChanged) {
      utils.build.cancelBuild(
        `Build was cancelled because ${currentProject} was not affected by the latest changes`
      );
    }
  }
};

function projectChanged(currentProject, fromHash, toHash) {
  const execSync = require('child_process').execSync;
  const getAffected = `yarn --silent nx print-affected --base=${fromHash} --head=${toHash}`;
  const output = execSync(getAffected).toString();
  //get the list of changed projects from the output
  const changedProjects = JSON.parse(output).projects;
  return !!changedProjects.find(project => project === currentProject);
}
