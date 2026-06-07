import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"

export default buildModule("QuestBoardModule", (m) => {
  const board = m.contract("Test")
  return { board }
})