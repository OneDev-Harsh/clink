import type {Stagehand} from "@browserbasehq/stagehand"

export async function observe({
    stagehand,
    instruction,
}:{
    stagehand: Stagehand,
    instruction: string,
}){
    const actions = await stagehand.observe(instruction)

    return {matches: actions.map(({selector, description}) => ({selector, description}))}
}
