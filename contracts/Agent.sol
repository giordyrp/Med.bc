pragma solidity ^0.5.0;
import './MedicalHistory.sol';

contract Agent {


    address public myAddress;
    string public name;
    string public uid;
    string public did;
    string public aType;
    MedicalHistory public mHistory;

    constructor(address ma, string memory nm,string memory ui, string memory di,string memory tp) public{
        mHistory = new MedicalHistory({nm:'',ha:'',pn:''});
        myAddress = ma;
        name = nm;
        uid = ui;
        did = di;
        aType = tp;
    }

}