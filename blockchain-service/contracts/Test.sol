// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Test {
    struct Quest { string title; uint256 reward; bool active; }

    address public owner;
    Quest[] public quests;
    mapping(address => uint256) public points;
    mapping(address => mapping(uint256 => bool)) public completed;

    event QuestAdded(uint256 indexed questId, string title);
    event QuestCompleted(address indexed player, uint256 indexed questId, uint256 reward);

    constructor() { owner = msg.sender; }

    function addQuest(string memory title, uint256 reward) public {
        require(msg.sender == owner, "only owner can add quests");
        quests.push(Quest(title, reward, true));
        emit QuestAdded(quests.length - 1, title);
    }

    function completeQuest(uint256 questId) public {
        require(questId < quests.length, "quest does not exist");
        require(quests[questId].active, "quest is not active");
        require(!completed[msg.sender][questId], "already completed");
        completed[msg.sender][questId] = true;
        points[msg.sender] += quests[questId].reward;
        emit QuestCompleted(msg.sender, questId, quests[questId].reward);
    }

    function questCount() public view returns (uint256) {
        return quests.length;
    }
}