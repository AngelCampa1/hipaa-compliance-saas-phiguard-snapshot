export const knownPhiguardPagesProjects = [
  "phiguard-marketing",
  "phiguard-site",
  "phiguard",
];

const phiguardPagesProjectPattern = /^phiguard/;

export function classifyPhiguardPagesProjects(projects) {
  const phiguardProjects = projects.filter((project) =>
    phiguardPagesProjectPattern.test(project),
  );

  return {
    deletableProjects: phiguardProjects.filter((project) =>
      knownPhiguardPagesProjects.includes(project),
    ),
    unallowlistedProjects: phiguardProjects.filter(
      (project) => !knownPhiguardPagesProjects.includes(project),
    ),
  };
}
