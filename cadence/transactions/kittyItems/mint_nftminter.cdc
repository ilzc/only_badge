import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import OnlyBadges from "../../contracts/OnlyBadges.cdc"

transaction(name: String, imageFile: String) {

    // local variable for storing the minter reference
    let minter: &OnlyBadges.AdminMinter

    let newMinter: AuthAccount;

    prepare(adminMinter: AuthAccount, newMinter: AuthAccount) {

        // borrow a reference to the NFTMinter resource in storage
        self.minter = adminMinter.borrow<&OnlyBadges.AdminMinter>(from: OnlyBadges.AdminMinterStoragePath)
            ?? panic("Could not borrow a reference to the NFT minter")
        self.newMinter = newMinter;
    }

    execute {
        // add new minter for specific token type
        self.minter.addMinter(minterAccount: self.newMinter, minterName: name, minterImageFile: imageFile)
    }
}