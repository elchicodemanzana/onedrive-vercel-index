import type { OdFolderChildren } from '../types'
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FC } from 'react'
import { useClipboard } from 'use-clipboard-copy'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTranslation } from 'next-i18next'

import { getBaseUrl } from '../utils/getBaseUrl'
import { humanFileSize, formatModifiedDateTime } from '../utils/fileDetails'

import { Downloading, ChildIcon, ChildName } from './FileListing'  // Usuń zbędne importy
import { getStoredToken } from '../utils/protectedRouteHandler'

const FileListItem: FC<{ fileContent: OdFolderChildren }> = ({ fileContent: c }) => {
  return (
    <div className="grid cursor-pointer grid-cols-10 items-center space-x-2 px-3 py-2.5">
      <div className="col-span-10 flex items-center space-x-2 truncate md:col-span-6" title={c.name}>
        <div className="w-5 flex-shrink-0 text-center">
          <ChildIcon child={c} />
        </div>
        <ChildName name={c.name} folder={Boolean(c.folder)} />
      </div>
      <div className="col-span-3 hidden flex-shrink-0 font-mono text-sm text-gray-700 dark:text-gray-500 md:block">
        {formatModifiedDateTime(c.lastModifiedDateTime)}
      </div>
      <div className="col-span-1 hidden flex-shrink-0 truncate font-mono text-sm text-gray-700 dark:text-gray-500 md:block">
        {humanFileSize(c.size)}
      </div>
    </div>
  )
}

const FolderListLayout = ({
  path,
  folderChildren,
  selected,
  toggleItemSelected,
  totalSelected,
  toggleTotalSelected,
  totalGenerating,
  toast,
  folderGenerating,
}) => {
  const router = useRouter(); // Dodaj router
  const clipboard = useClipboard();
  const hashedToken = getStoredToken(path);

  const { t } = useTranslation();

  // Get item path from item name
  const getItemPath = (name: string) => `${path === '/' ? '' : path}/${encodeURIComponent(name)}`;

  return (
    <div className="rounded bg-white shadow-sm dark:bg-gray-900 dark:text-gray-100">
      <div className="grid grid-cols-12 items-center space-x-2 border-b border-gray-900/10 px-3 dark:border-gray-500/30">
        <div className="col-span-12 py-2 text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300 md:col-span-6">
          {t('Name')}
        </div>
        <div className="col-span-3 hidden text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300 md:block">
          {t('Last Modified')}
        </div>
        <div className="hidden text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300 md:block">
          {t('Size')}
        </div>
      </div>

      {folderChildren.map((c: OdFolderChildren) => (
        <div
          className="grid grid-cols-12 transition-all duration-100 hover:bg-gray-100 dark:hover:bg-gray-850"
          key={c.id}
        >
          <div className="col-span-12 md:col-span-10">
            {/* Dodaj obsługę nawigacji za pomocą komponentu Link */}
            <Link href={`${path === '/' ? '' : path}/${encodeURIComponent(c.name)}`} passHref>
              <a>
                <FileListItem fileContent={c} />
              </a>
            </Link>
          </div>

          {c.folder ? (
            <div className="hidden p-1.5 text-gray-700 dark:text-gray-400 md:flex">
              <span
                title={t('Copy folder permalink')}
                className="cursor-pointer rounded px-1.5 py-1 hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() => {
                  clipboard.copy(`${getBaseUrl()}${`${path === '/' ? '' : path}/${encodeURIComponent(c.name)}`}`);
                  toast(t('Copied folder permalink.'), { icon: '👌' });
                }}
              >
                <FontAwesomeIcon icon={['far', 'copy']} />
              </span>
              {folderGenerating[c.id] ? (
                <Downloading title={t('Downloading folder, refresh page to cancel')} style="px-1.5 py-1" />
              ) : (
                <div className="hidden p-1.5 text-gray-700 dark:text-gray-400 md:flex">
                  {/* Remove the permalink button for individual files */}
                </div>
              )}
            </div>
          ) : (
            <div className="hidden p-1.5 text-gray-700 dark:text-gray-400 md:flex">
              {/* Remove the permalink button for individual files */}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default FolderListLayout;
