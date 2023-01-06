import React from 'react'
import format from 'date-fns/formatDistanceStrict'
import { alertOptions, AlertTheme, alertThemeMap, ChannelInfo, defaultSettings, Settings } from '~/utils'
import { ONE_S, SliderInner } from '../primitives/Slider'
import { FaCheck, FaTrophy } from 'react-icons/fa'
import useCopyToClipboard from '../hooks/useCopyToClipboard'
import Select from 'react-select'
import Input from '../primitives/Input'

export default function Obs({
  channelInfo,
  settings,
  setSettings,
}: {
  channelInfo: ChannelInfo
  settings: Settings
  setSettings: React.Dispatch<React.SetStateAction<Settings>>
}) {
  const [copiedAlertURL, copyAlertURL] = useCopyToClipboard(
    `https://giveaway-o-tron.vercel.app/alerts/gw2?channel=${channelInfo.userId}&rv=2`
  )
  const [copiedStatusURL, copyStatusURL] = useCopyToClipboard(
    `https://giveaway-o-tron.vercel.app/alerts/status?channel=${channelInfo.userId}&rv=2`
  )
  return (
    <div className="mt-2 flex flex-col gap-3 flex-1 pb-2 max-h-full">
      <h1 className="text-3xl -mb-1">OBS Settings</h1>
      <div className="flex flex-row gap-2">
        <button
          className="bg-purple-600 px-2 py-1 flex-1 rounded-md transition-transform hover:scale-110 flex flex-row gap-1 justify-center items-center"
          onClick={() => copyAlertURL()}
        >
          {copiedAlertURL ? (
            <>
              <FaCheck /> Copied
            </>
          ) : (
            <>
              <FaTrophy /> Copy Winner Alert Source URL
            </>
          )}
        </button>
        <button
          className="bg-purple-600 px-2 py-1 flex-1 rounded-md transition-transform hover:scale-110 flex flex-row gap-1 justify-center items-center"
          onClick={() => copyStatusURL()}
        >
          {copiedStatusURL ? (
            <>
              <FaCheck /> Copied
            </>
          ) : (
            <>
              <FaTrophy /> Copy Giveaway Status Alert Source URL
            </>
          )}
        </button>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2">
          <div className="flex-1">
            <h2 className="text-xl">Alert Settings</h2>
          </div>
        </div>
        <div className="flex flex-row gap-2 justify-center items-center">
          <div className="flex-1 border border-purple-600 rounded-md flex relative">
            <div
              className="bg-purple-600 px-2 py-1 flex-0"
              title="Will clear chat, and then pause it after the time, to enable a giveaway with cut off"
            >
              Duration
            </div>
            <div className="px-2 flex-1 flex justify-center items-center">
              <SliderInner
                min={ONE_S}
                max={ONE_S * 30}
                value={settings.alertDuration || defaultSettings.alertDuration}
                step={ONE_S}
                onChange={(v) => setSettings((s) => ({ ...s, alertDuration: v }))}
              />
            </div>
            <div className="flex-1 justify-center items-center text-center flex">
              {format(Date.now() + (settings.alertDuration || defaultSettings.alertDuration), new Date())}
            </div>
          </div>
          <div className="flex-1 border border-purple-600 rounded-md flex relative">
            <div
              className="bg-purple-600 px-2 py-1 flex-0"
              title="Will clear chat, and then pause it after the time, to enable a giveaway with cut off"
            >
              Theme
            </div>
            <Select
              isSearchable={false}
              isClearable={false}
              onChange={(e) => {
                setSettings((s) => ({ ...s, alertTheme: e?.value! }))
              }}
              styles={{
                container: (provided) => ({
                  ...provided,
                  flex: 1,
                }),
                input: (provided) => ({
                  ...provided,
                  outline: 'none',
                }),
                control: (provided) => ({
                  ...provided,
                  backgroundColor: '#1f2937',
                  border: 0,
                  color: '#FFFFFF',
                  borderBottomLeftRadius: 0,
                  borderTopLeftRadius: 0,
                  height: 32,
                  minHeight: 32,
                  cursor: 'pointer',
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: '#FFFFFF',
                  textAlign: 'center',
                }),
                menu: (provided) => ({
                  ...provided,
                  border: '1px solid #7c3aed',
                  backgroundColor: '#4b5563',
                }),
                menuList: (provided) => ({
                  ...provided,
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isFocused ? '#7c3aed' : state.isSelected ? '#7c3aed' : undefined,
                  cursor: 'pointer',
                }),
              }}
              value={alertOptions.find((i) => (settings.alertTheme || defaultSettings.alertTheme) === i.value)}
              options={alertOptions}
            />
          </div>
        </div>
      </div>

      {settings.alertTheme === AlertTheme.Custom ? (
        <div className="flex flex-col gap-2">
          <div className="flex flex-row gap-2">
            <div className="flex-1">
              <h2 className="text-xl">Custom Theme Settings</h2>
            </div>
          </div>
          <Input
            value={settings.alertCustomImageUrl}
            label="Image URL"
            placeholder="URL..."
            onChange={(e) => setSettings((s) => ({ ...s, alertCustomImageUrl: (e.target as any).value.trim() }))}
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-2 flex-1">
        <div className="flex flex-row gap-2">
          <div className="flex-1">
            <h2 className="text-xl">Preview</h2>
          </div>
        </div>
        <div className="flex-1">
          <div className="bg-gray-600 rounded-md h-full w-full flex py-2 relative">
            {settings.alertTheme === AlertTheme.Custom ? (
              <CustomPreview imageUrl={settings.alertCustomImageUrl} />
            ) : (
              <GW2Preview />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function CustomPreview({ imageUrl }: { imageUrl?: string }) {
  return (
    <div className="flex-1 flex flex-col justify-center items-center gap-2 text-center">
      {imageUrl ? (
        <div
          className="flex-1 flex justify-center items-center relative w-full overflow-hidden"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
        />
      ) : null}
      <div className="flex-0 flex justify-center items-center text-2xl uppercase">@name won!</div>
    </div>
  )
}

function GW2Preview() {
  return (
    <div className="relative h-full w-full">
      <div
        className="flex flex-1 flex-col justify-center items-center bg-transparent animate-wiggle absolute inset-0"
        style={{ scale: '50%' }}
      >
        <img src="https://giveaway-o-tron.vercel.app/images/chest-notification.png" />
        <div
          className="text-white text-4xl uppercasetext-bold left-0 right-0 text-center absolute"
          style={{ top: '48%' }}
        >
          Giveaway chest!
        </div>
        <div
          className="text-white text-3xl uppercase px-4 py-2 text-bold text-center absolute break-all"
          style={{ top: '75%', left: 50, right: 50 }}
        >
          @name won!
        </div>
      </div>
    </div>
  )
}
