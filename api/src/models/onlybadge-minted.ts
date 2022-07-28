import { BaseModel } from "./base"

class OnlyBadgesMinted extends BaseModel {
  id!: number;
  name!: string;
  badge_image!: string;
  number!: string;
  max!: string;
  transaction_id!: string;

  static get tableName() {
    return "onlybadges_minted";
  }
}

export { OnlyBadgesMinted }
