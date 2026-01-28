const Group=require('../model/group');
const groupDao={
    createGroup:async(groupData)=>{
        const group=new Group(groupData);
        return await group.save();

    }
    

};

module.exports=groupDao;