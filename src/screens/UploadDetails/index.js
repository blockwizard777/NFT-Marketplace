import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import cn from "classnames";
import styles from "./UploadDetails.module.sass";
import Dropdown from "../../components/Dropdown";
import Icon from "../../components/Icon";
import TextInput from "../../components/TextInput";
import Switch from "../../components/Switch";
import Loader from "../../components/Loader";
import Modal from "../../components/Modal";
import Preview from "./Preview";
import Cards from "./Cards";
import FolowSteps from "./FolowSteps";

// NFT Market
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import Web3Modal from 'web3modal'



import {
  nftaddress, nftmarketaddress
} from '../../config'

import NFT from '../../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../../artifacts/contracts/NFTMarket.sol/NFTMarket.json'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

const royaltiesOptions = ["10%", "20%", "30%"];

const items = [
  {
    title: "Create collection",
    color: "#4BC9F0",
  },
  {
    title: "Crypto Legend - Professor",
    color: "#45B26B",
  },
  {
    title: "Crypto Legend - Professor",
    color: "#EF466F",
  },
  {
    title: "Legend Photography",
    color: "#9757D7",
  },
];

const Upload = () => {
  const [royalties, setRoyalties] = useState(royaltiesOptions[0]);
  const [sale, setSale] = useState(true);
  const [price, setPrice] = useState(false);
  const [locking, setLocking] = useState(false);
  const [buy, setBuy] = useState(false);

  const [visibleModal, setVisibleModal] = useState(false);

  const [visiblePreview, setVisiblePreview] = useState(false);



  // NFT Market
  const [fileUrl, setFileUrl] = useState(null)
  const [formInput, updateFormInput] = useState({price: '', name: '', description: '', propertie: '' })

  async function onChange(e) {
      const file = e.target.files[0]
      try {
          const added = await client.add(
              file, 
              {
                  progress: (prog) => console.log(`received: ${prog}`)
              }
          )
          const url = `https://ipfs.infura.io/ipfs/${added.path}`
          setFileUrl(url)
      } catch (e) {
          console.log(e)
      }
  }

  async function createItem() {
      const { name, description, price } = formInput
      if(!name || !description || !price || !fileUrl) return alert('not valiable')
      const data = JSON.stringify({
          name, description, image: fileUrl
      })
      try {
          const added = await client.add(data)
          const url = `https://ipfs.infura.io/ipfs/${added.path}`
          // after file is uploaded to IPFS, pass the URL to save it on Polygon 
          createSale(url)
      } catch (e) {
          console.log('Error upload file: ', e)
      }
  }
  let history = useHistory()
  async function createSale(url) {
      setBuy(true)
      const web3Modal = new Web3Modal()
      const connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      const signer = provider.getSigner()

      let contract = new ethers.Contract(nftaddress, NFT.abi, signer)
      let transaction = await contract.createToken(url)
      let tx = await transaction.wait()

      let event = tx.events[0]
      let value = event.args[2]
      let tokenId = value.toNumber()

      const price = ethers.utils.parseUnits(formInput.price, 'ether')

      contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
      let listingPrice = await contract.getListingPrice()
      listingPrice = listingPrice.toString()

      console.log( nftaddress, tokenId, price, listingPrice)
      transaction = await contract.createMarketItem(
          nftaddress, tokenId, price, { value: listingPrice }
      )
      await transaction.wait()
      // router.push('/')
      
      history.push("/")
  }

  return (
    <>
      <div className={cn("section", styles.section)}>
        <div className={cn("container", styles.container)}>
          <div className={styles.wrapper}>
            <div className={styles.head}>
              <div className={cn("h2", styles.title)}>
                Create single collectible
              </div>
              <button
                className={cn("button-stroke button-small", styles.button)}
              >
                Switch to Multiple
              </button>
            </div>
            <form className={styles.form} action="">
              <div className={styles.list}>
                <div className={styles.item}>
                  <div className={styles.category}>Upload file</div>
                  <div className={styles.note}>
                    Drag or choose your file to upload
                  </div>
                  <div className={styles.file}>
                    <input className={styles.load} type="file" onChange = {onChange}/>
                    <div className={styles.icon}>
                      <Icon name="upload-file" size="24" />
                    </div>
                    <div className={styles.format}>
                      PNG, GIF, WEBP, MP4 or MP3. Max 1Gb.
                    </div>
                  </div>
                </div>
                <div className={styles.item}>
                  <div className={styles.category}>Item Details</div>
                  <div className={styles.fieldset}>
                    <TextInput
                      className={styles.field}
                      label="Item name"
                      name="Item"
                      type="text"
                      placeholder='e. g. Redeemable Bitcoin Card with logo"'
                      onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
                      required
                    />
                    <TextInput
                      className={styles.field}
                      label="Description"
                      name="Description"
                      type="text"
                      placeholder="e. g. “After purchasing you will able to recived the logo...”"
                      onChange = {e => updateFormInput({ ...formInput, description: e.target.value })}
                      required
                    />
                    <div className={styles.row}>
                      <div className={styles.col}>
                        <div className={styles.field}>
                          <div className={styles.label}>Royalties</div>
                          <Dropdown
                            className={styles.dropdown}
                            value={royalties}
                            setValue={setRoyalties}
                            options={royaltiesOptions}
                          />
                        </div>
                      </div>
                      <div className={styles.col}>
                        <TextInput
                          className={styles.field}
                          label="Size"
                          name="Size"
                          type="text"
                          placeholder="e. g. Size"
                          required
                        />
                      </div>
                      <div className={styles.col}>
                        <TextInput
                          className={styles.field}
                          label="Propertie"
                          name="Propertie"
                          type="text"
                          placeholder="e. g. Propertie"
                          onChange={e => updateFormInput({ ...formInput, propertie: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.options}>
                <div className={styles.option}>
                  <div className={styles.box}>
                    <div className={styles.category}>Put on sale</div>
                    <div className={styles.text}>
                      You’ll receive bids on this item
                    </div>
                  </div>
                  <Switch value={sale} setValue={setSale} />
                </div>
                <div className={styles.option}>
                  <div className={styles.box}>
                    <div className={styles.category}>Instant sale price</div>
                    <div className={styles.text}>
                      Enter the price for which the item will be instantly sold
                    </div>
                  </div>
                  <Switch value={price} setValue={setPrice} />
                  
                </div>
                {price && (
                  <div className={styles.option}>
                    <TextInput
                      className={styles.field}
                      label="Price"
                      name="price"
                      type="text"
                      placeholder="e. g. price"
                      onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
                      required
                    />
                  </div>
                )}
                
                <div className={styles.option}>
                  <div className={styles.box}>
                    <div className={styles.category}>Unlock once purchased</div>
                    <div className={styles.text}>
                      Content will be unlocked after successful transaction
                    </div>
                  </div>
                  <Switch value={locking} setValue={setLocking} />
                </div>
                <div className={styles.category}>Choose collection</div>
                <div className={styles.text}>
                  Choose an exiting collection or create a new one
                </div>
                <Cards className={styles.cards} items={items} />
              </div>
              <div className={styles.foot}>
                <button
                  className={cn("button-stroke tablet-show", styles.button)}
                  onClick={() => setVisiblePreview(true)}
                  type="button"
                >
                  Preview
                </button>
                <button
                  className={cn("button", styles.button)}
                  onClick={() => setVisibleModal(true)}
                  // type="button" hide after form customization
                  type="button"
                >
                  <span>Create item</span>
                  <Icon name="arrow-next" size="10" />
                </button>
                <div className={styles.saving}>
                  <span>Auto saving</span>
                  <Loader className={styles.loader} />
                </div>
              </div>
            </form>
          </div>
          <Preview
            className={cn(styles.preview, { [styles.active]: visiblePreview })}
            formInput={formInput}
            fileUrl={fileUrl}
            onClose={() => setVisiblePreview(false)}
          />
        </div>
      </div>
      <Modal visible={visibleModal} onClose={() => setVisibleModal(false)}>
        <FolowSteps className={styles.steps} createItem={createItem} buy={buy}/>
      </Modal>
    </>
  );
};

export default Upload;
